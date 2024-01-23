---
title: Choose boring and flexible, not malleable
slug: choose-boring
summary: Using simple and flexible tools doesn't make your work boring. In fact, it can lead to more exciting results.
publishedAt: "2024-01-22"
image: ./melting.jpeg
# discussReddit: 192j9s9
# discussHackerNews: 38965854
categories:
- "@=yassg_get('categories', '/devops.md')"
- "@=yassg_get('categories', '/engineering.md')"
- "@=yassg_get('categories', '/programming.md')"
series: []
keywords:
- predictability
- production
- reliability
- boring
---

Have you ever imagined what would happen if the bridge you were crossing suddenly disappeared?
You're suspended in midair, and you're trying to imagine what would happen if the bridge was not there.

You'd fall, of course.

But you don't. The bridge is there, it was there yesterday, and it will almost 100% be there tomorrow, with cars, trucks and trains crossing it safely, even in the worst weather conditions. 
That's so impressive it should make you want to get out as soon as you cross any bridge, turn around and applaud your palms off to the majesty of its existence.

It takes a lot of effort to keep a bridge standing!
It wants to fall down all by itself, and it **especially** wants to fall down when you use it, doubly so after the holiday season. 

Yet, there it stands, we just use it and move on like it's nothing, except we basically levitated across a river. Bridges are magic.

## What is this, a bolt for ants?

This is a stainless steel bolt.

^^^
![A stainless steel bolt]({{ yassg_thumbnail('./bolt.jpeg', {width: 400}) }})
^^^ [Image]: A stainless steel bolt

It has one job: when you tighten it, it stays tight. It doesn't do anything else, it doesn't want to do anything else.
We use them to build bridges which cross vast distances, submarines which go into deep water, spaceships which go into space, and roller coasters which go into your stomach.
All those things are amazing, without the bolt being anything more than a bolt.

Here's a bolt made of gummy bear.

^^^
![A gummy bear bolt]({{ yassg_thumbnail('./gummy-bolt.jpeg', {width: 400}) }})
^^^ [Image]: A gummy bear bolt, yummy!

It's kind of fun how it's a gummy bear, you can also bend it any way you like and make interesting shapes. But you can't put your weight on it and know what will happen. It only somewhat looks as a bolt.
Would you ride in a submarine using them? Would you cross a bridge made with them?

Why then use them in your software?

## Flexible versus malleable

Many people, especially new engineers, mistakenly think that using complex tools and languages makes us more innovative and creative.

However, the opposite is true. The most effective components are simple, predictable, and boring. The boring is what grants us the bedrock we need to reach for a software equivalent of blasting a person into outer space. **The "into outer space" part is meant to be the exciting part, the tools are not.** You don't need your bolts to be gummy bears to make an interesting bridge, you need them to be bolts while you're designing your crazy bridge within the constraints of still being a safe bridge.

We need flexible tools, not malleable ones.

Flexible tools provide options within their constraints. For example, to make a 6x6 LEGO plate, we can combine a 4x6 and 2x6 plate. That's flexibility.

Malleable means we can change the constraints. For example, to make a 6x6 LEGO plate, we could melt a 8x8 plate with a lighter and pliers.

^^^
![A lighter melting a blue LEGO plate]({{ yassg_thumbnail('./melting.jpeg', {width: 400}) }})
^^^ [Image]: Making a 6x6 LEGO plate the malleable way

> The boring is (what) we need to reach for a software equivalent of blasting a person into outer space

Even if the final solution is not exciting, you still don't want the tools to be because [it gets old fast fixing tooling issues daily](http://www.sarahmei.com/blog/2013/11/11/why-you-should-never-use-mongodb/comment-page-1/) on projects you don't even care about.

We want tools and languages that are boring and predictable. The stack we use must be well-understood, reliable, and consistent. The predictability of programming languages and frameworks allows developers to build complex and innovative solutions with confidence. Introducing unpredictability at the foundational level would lead to chaos, hindering the ability to create robust and dependable software.

## Conclusion

Using simple, boring but flexible components is crucial for creativity and innovation. Whether in the physical world or not, predictability is the key to unlocking the potential for groundbreaking solutions. Embracing the inherent predictability of production components enables us to build, create, and innovate with confidence, knowing that we're standing on rock while doing it.
