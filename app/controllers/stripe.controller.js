const db = require('../models')
const Project = db.project;
const User = db.user;
const Award = db.award;

const endpointSecret = process.env.STRIPE_ENDPOINT;

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

let paid_invoices = {}

exports.handleStripeWebhook = async (req, res) => {
  let event = req.body;

  // Only verify the event if you have an endpoint secret defined.
  // Otherwise use the basic event deserialized with JSON.parse
  if (endpointSecret) {
    // Get the signature sent by Stripe
    const signature = req.headers['stripe-signature'];

    // try {
    //   event = stripe.webhooks.constructEvent(
    //     req.body,
    //     signature,
    //     endpointSecret
    //   );
    // } catch (err) {
    //   console.log(`⚠️  Webhook signature verification failed.`, err.message);
    //   return res.sendStatus(400);
    // }
  }
  let object;
  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
      break;
    case 'customer.created':
      const customer = event.data.object;
      console.log(`New customer ${customer.id} is created!`);
      break;
    case 'payment_method.attached':
      object = event.data.object;
      const user = await User.findOne({ stripe_customer_token: object.customer });
      if (user) {
        user.payment_method = 'verified'
        await user.save()
      } else {
        console.log("Can't find this user!")
      }
      console.log(`Payment method is attached on customer ${object.customer}!`);
      break;
    // case 'customer.subscription.created':
    //   await StripeService.subscription_updated(event)
    //   break;
    // case 'customer.subscription.updated':
    //   await StripeService.subscription_updated(event)
    //   break;
    // case 'customer.subscription.deleted':
    //   await StripeService.subscription_cancelled(event)
    //   break;
    // case 'customer.subscription.trial_will_end':
    //   await StripeService.subscription_trial_end(event)
    //   break;
    // case 'plan.created':
    //   await StripeService.plan_created(event)
    //   break;
    // case 'charge.failed':
    //   await StripeService.charge_failed(event)
    //   break;
    // case 'checkout.session.completed':
    //   const response = await StripeService.checkout_session_completed(event)
    //   if(response.error) {
    //     apiResponse.errorResponseWithData(res, response.message, {data: response})
    //   }
    //   break;
    case 'invoice.paid':
      const event_object = event.data.object;
      const customerId = event_object.customer;
      const planId = event_object.lines.data[0].plan.id;
      paid_invoices[planId] = (paid_invoices[planId] || {})
      paid_invoices[planId][customerId] = false
      console.log(`Payment succeeded invoice ${event_object.id}!`);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.send();
}

exports.createNewCustomerOnStripe = async (req, res) => {
  try {
    let data = req.body;
    let result = await stripe.customers.create({
      name: data.name,
      email: data.email,
    });
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
}

exports.createPaymentIntentOnStripe = async (req, res) => {
  try {
    const paymentMethodId = req.body.paymentMethodId
    const customerId = req.body.customerId
    // Attach the payment method to the customer
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    if (paymentMethod && paymentMethod.customer === customerId) {
      // PaymentMethod is attached to the correct customer, no need to reattach
      console.log(`PaymentMethod ${paymentMethodId} is already attached to Customer ${customerId}`);
    } else {
      // Attach PaymentMethod to Customer
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
      console.log(`PaymentMethod ${paymentMethodId} attached to Customer ${customerId}`);
    }

    // Set the attached payment method as the default for the customer
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 50,
      currency: 'cad',
      payment_method: paymentMethodId,
      customer: customerId,
    });

    return res.send({ clientSecret: paymentIntent.client_secret });
  } catch (e) {
    console.error("error:", e)
    return res.send({ error: e });
  }
}

exports.createProductAndPlanOnStripe = async (pardnaName, amount, duration) => {
  try {
    // Create a product
    const product = await stripe.products.create({
      name: `Pardna ${pardnaName}`,
      type: 'service'
    });

    switch (duration) {
      case 'Weekly':
        duration = 'week';
        break;
      case 'Monthly':
        duration = 'month';
        break;
      case 'Yearly':
        duration = 'year';
        break;
      default:
        duration = 'day';
        break;
    }

    // Create a plan using the product
    const plan = await stripe.plans.create({
      nickname: pardnaName,
      amount: amount * 100,
      interval: duration,
      interval_count: 1,
      product: product.id,
      currency: 'cad'
    });

    return plan;
  } catch (error) {
    console.log(error);
    return;
  }
}

exports.createSubscriptions = async (planId, endDate, activeMembers) => {
  try {
    const subscriptions = await Promise.all(activeMembers.map(async (member) => {
      const memberInfo = await User.findById(member['_id'])

      // Create a subscription
      const subscription = await stripe.subscriptions.create({
        customer: memberInfo.stripe_customer_token,
        items: [
          { plan: planId },
        ],
        cancel_at: Math.floor(endDate.getTime() / 1000),
      });

      console.log('Subscription created:', subscription.id);
      return subscription.id;
    }));

    return subscriptions;
  } catch (error) {
    console.error('Error creating subscription:', error);
    return;
  }
}


exports.createPayouts = async (req, res) => {
  try {
    const customerId = req.body.customerId;

    const customer = await stripe.customers.retrieve(customerId);
    const defaultPaymentMethod = customer.invoice_settings.default_payment_method;
    console.log(defaultPaymentMethod);
    // const payout = await stripe.payouts.create({
    //   amount: 1,
    //   currency: 'cad',
    //   method: 'standard',
    //   destination: defaultPaymentMethod,
    // });
    // const payout = await stripe.paymentIntents.create({
    //   amount: 50, 
    //   currency: 'cad',
    //   customer: customerId,
    //   description: 'Example charge',
    //   payment_method_types: ['card'], 
    //   payment_method: defaultPaymentMethod,
    //   confirm: true 
    // });

    // console.log('Payout successful:', payout);
    const payout = await stripe.balance.retrieve();

    res.status(200).send({ payout: payout });
  } catch (error) {
    console.log('Unexpected Error: ', error.toString())
    res.status(500).send({ message: error.toString() })
  }
}

exports.handlePaidInvoice = async () => {
  try {
    let award_data = []
    await Promise.all(Object.keys(paid_invoices).map(async (planId) => {
      let paid_customers = paid_invoices[planId];
      const plan = await Project.findOne({ stripe_plan_token: planId });
      const paid_members = plan.paid_members || {};
      if (plan) {
        Object.keys(paid_customers).map(item => {
          paid_customers[item] = (paid_customers[item] || paid_members[item] || false);
        })
        if (Object.keys(paid_customers).length == parseInt(plan.number)) {
          const keys = Object.keys(paid_customers).filter(key => paid_customers[key] == false);
          // Choose a random key
          const randomKey = keys[Math.floor(Math.random() * keys.length)];
          // Set the chosen key to true
          paid_customers[randomKey] = 'awarded';
          award_data.push({ customerId: randomKey, projectId: plan['_id'], awardedAt: new Date() })
        }

        plan.paid_members = paid_customers;
        await plan.save();
      }
    }));
    await Award.insertMany(award_data);
    paid_invoices = {}
  } catch (error) {
    console.log(error);
  }
}

exports.payoutCronJob = async () => {
  try {
    const awardList = await Award.find({ paidAt: { $exists: false } });
    const balance = await stripe.balance.retrieve();
    if (awardList.length && balance) {
      const project = await Project.find({ _id: awardList[0].projectId })
      const awardAmount = parseFloat(project.amount) * 100 * parseInt(project.number)
      const availableBalance = balance.available[0].amount
      const pendingBalance = balance.pending[0].amount

      if ((availableBalance > awardAmount) && awardList[0].customerId) {

        const customer = await stripe.customers.retrieve(awardList[0].customerId);
        const defaultPaymentMethod = customer.invoice_settings.default_payment_method;

        const payout = await stripe.payouts.create({
          amount: awardAmount,
          currency: 'cad',
          method: 'standard',
          destination: defaultPaymentMethod,
        });

        console.log('Payout successful:', payout);
        if (payout) {
          awardList[0].payout = payout;
          awardList[0].paidAt = new Date();
          await awardList[0].save()
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
}