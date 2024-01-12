---
title: Adding feature flags to your Symfony app
slug: symfony-feature-flags
summary: Adding feature flags to your Symfony app was never easier than with Gitlab and Unleash Symfony bundle
publishedAt: "2024-01-08"
image: ./checkmark.jpeg
discussReddit: 192j9s9
discussHackerNews: 38965854
categories:
- "@=yassg_get('categories', '/programming.md')"
series: []
keywords:
- Symfony
- Gitlab
- Unleash
---

While developing [Remembase](https://remembase.com/), our goal was to control the rate of new user registrations during the testing of the onboarding process.

The simplest solution was to implement a waitlist, allowing users to express their interest in the product. We could then invite them to join when we were ready.
But, a waitlist is also a hurdle for all new users which we don't want to have, we want users to be able to register and use the product as soon as possible.

To solve these opposite goals, we've introduced a feature flag `waitlist` which allows us to enable the waitlist when things start to get out of hand, and disable it when we're ready to onboard more users.

## What are feature flags?

Feature flags, also known as "feature toggles," provide a way to reconfigure your app's behavior without altering the code. They allow you to enable or disable certain features of your app at runtime, without having to redeploy your code.

The basic idea behind feature flags is simple, it's just a condition:

^^^
```javascript
if (featureFlagEnabled('newFeature')) {
    doNewFeature();
}
```
^^^ [Example]: Adding a new feature

We can also use it to roll out new experience for an existing feature:

^^^
```javascript
if (featureFlagEnabled('newExperienceForOldFeature')) {
    doNewExperience();
} else {
    doOldExperience();
}
```
^^^ [Example]: Adding a new experience for an existing feature

### Why not just use configuration?

Feature flags are a great way to manage configuration, but they're not a replacement for it. They're best used in conjunction with configuration, not instead of it.

The main value of feature flags is that they allow you to change your app's behavior without having to redeploy your code. This makes it easy to experiment with new features, or to roll out new experiences for existing features without having to redeploy your code, allowing continuous delivery while a feature is still in development.

## How to use feature flags with Gitlab?

[Gitlab supports feature flags](https://docs.gitlab.com/ee/operations/feature_flags.html) using the Unleash protocol. This protocol allows you to manage your feature flags in a centralized location, making it easy to enable or disable them across multiple environments.

In this case, Gitlab acts as an Unleash server, and your app acts as an Unleash client. The Unleash client connects to the Unleash server to get the status of each feature flag, and then uses that information to determine whether to enable the feature flag in your app.

In our Gitlab project, we use **Deploy / Feature flags** to create a new feature flag `waitlist`:

^^^
![The feature flag from within Gitlab]({{ yassg_thumbnail('./screenshot1.png') }})
^^^ [Image]: The feature flag from within Gitlab

This is already enough to start using the feature flag in our app. 

## How to use feature flags with Symfony?

### Integrate the Gitlab Unleash server into Symfony

We only need to integrate with the Unleash server once to use as many feature flags as we like.

Until Symfony introduces native [feature](https://github.com/symfony/symfony/pull/51649) [flag](https://github.com/symfony/symfony/pull/53213) support, we can leverage the [Unleash Symfony bundle](https://packagist.org/packages/unleash/symfony-client-bundle) provided by the Unleash project.

1. install the bundle:
   ```shell 
   composer require unleash/symfony-client-bundle
   ``` 
   Bundle is either enabled by Flex or enable it manually, see [The Bundle System](https://symfony.com/doc/current/bundles.html).
2. collect the server API URL and instance ID from Gitlab UI:
   ^^^
   ![The feature flag configuration button]({{ yassg_thumbnail('./screenshot2.png') }})
   ^^^ [Image]: The feature flag configuration button 
3. [configure the bundle](https://github.com/Unleash/unleash-client-symfony/tree/main?tab=readme-ov-file#basic-usage) with the configuration from previous step:
   ^^^
   ```yaml
   unleash_symfony_client:
       # these values are provided by Gitlab in the previous step
       app_url: 'https://gitlab.com/api/v4/feature_flags/unleash/12345678'
       instance_id: 'your-instance-id'
       app_name: 'your-app-name' 
   ```
   ^^^ [Example]: The Unleash bundle configuration
   App name should match your [Gitlab deployment environment name](https://docs.gitlab.com/ee/ci/environments/) (if used), it allows further configuration of feature flag value strategies.

This is enough to start using the feature flag in our app.

### Use the feature flag in your Twig templates

We can now use the feature flag in our Twig templates:

^^^
```twig
{{ '{%' }} if 'waitlist' is enabled %}
    <a>Join the waitlist</a>
{{ '{%' }} else %}
    <button>Get started</button>
{{ '{%' }} endif %}
``` 
^^^ [Example]: Using the feature flag in Twig template

### Use the feature flag in your Symfony controllers

The Unleash client will get autowired by default if you request `Unleash\Client\Unleash` in your controller:

^^^
```php
use Unleash\Client\Unleash;

class DefaultController extends AbstractController
{
    public function __construct(private Unleash $unleash) {}

    public function __invoke(Request $request): Response
    {
        if ($this->unleash->isEnabled('waitlist')) {
            // waitlist is enabled
        }
    }
}
```
^^^ [Example]: Using the feature flag in Symfony controller

### Use the feature flag in your Symfony forms

We add an option which we can configure in our form type:

^^^
```php
class UserAccountCreationRequestType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('email', EmailType::class)
        ;

        if ($options['code_required'] === true) {
            $builder
                ->add('code', TextType::class, [
                    'constraints' => [
                        new NotBlank(),
                        new InvitationCode(),
                    ],
                ])
            ;
        }
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'code_required' => true,
        ]);
    }
}
```
^^^ [Example]: Adding a new field to the form based on the option `code_required`

Now, when we create the form, we can pass the feature flag value to the form:

^^^
```php
class RegisterController extends AbstractController
{
    public function __construct(private Unleash $unleash) {}
    
    public function __invoke(Request $request): Response
    {
        $form = $this->createForm(UserAccountCreationRequestType::class, options: [
            'code_required' => $this->unleash->isEnabled('waitlist'),
        ]);
        
        // form now has the code field enabled or disabled based on the feature flag value
    }
}
```
^^^ [Example]: Passing the feature flag value to the form option

## Conclusion

Feature flags are excellent for managing configuration, but they are not a replacement for it. They're best used in conjunction with configuration, not instead of it.

Use them to quickly enable or disable features in your app, or to roll out new experiences for existing features without having to redeploy your code.
