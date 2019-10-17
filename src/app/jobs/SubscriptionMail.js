import Mail from '../../libs/Mail';

class SubscriptionMail {
  get key() {
    return 'SubscriptionMail';
  }

  async handle({ data }) {
    const { subscription } = data;
    await Mail.sendMail({
      to: `${subscription.meetup.user.name} <${subscription.meetup.user.email}>`,
      subject: 'Inscricao',
      template: 'subscription',
      context: {
        organizador: subscription.meetup.user.name,
        meetup: subscription.meetup.title,
        user: subscription.user.name,
        email: subscription.user.email,
      },
    });
  }
}

export default new SubscriptionMail();
