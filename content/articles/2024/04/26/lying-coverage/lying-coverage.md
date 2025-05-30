---
title: Your code coverage is lying
slug: lying-coverage
summary: Code coverage is a metric which does NOT represent how much or how well our code is tested. 
publishedAt: "2024-04-26"
image: ./greenwashing.jpeg
discussReddit: 1cg0fbz
# discussHackerNews: 39101887
categories:
- "@=yassg_get('categories', '/engineering.md')"
- "@=yassg_get('categories', '/programming.md')"
- "@=yassg_get('categories', '/quality.md')"
series: []
keywords:
- quality
- testing
- qa
- code coverage
- mutation testing
---

Many developers (and their managers) mistakenly believe that code coverage measures the percentage of code that has been (thoroughly) tested. Unfortunately, this is not the case.

Code coverage measures the percentage of code that has been executed during testing. This subtle distinction is crucial, as it highlights a significant gap between what developers think they're measuring and what they're actually measuring.

In fact, misusing code coverage can lead to a false sense of security where developers (and their managers) see magic number get bigger and red checkmarks becoming green, a greenwashing effect which is easy to put on a chart and show to stakeholders, but doesn't actually represent the quality of the codebase.

^^^
{{ yassg_picture('./greenwashing.jpeg', {width: 600}) }}
^^^ [Image]: Greenwashing

## What is code coverage then?

^^^
> a percentage measure of the degree to which the source **code of a program is executed** when a particular test suite is run
^^^ [Quote]: [Wikipedia: Code coverage](https://en.wikipedia.org/wiki/Code_coverage) (emphasis added)

The part "is executed" is key, the code which is marked as "covered" is the code that was executed during the test run. It doesn't mean that the code was tested, it just means that it was executed.

What's the difference? If it's executed while the tests run, it's tested, right? No.

**Consider a following example:** I'm testing a firecracker in my backyard. I light it up and, while it's burning, there's a sudden earthquake, the firecracker explodes. I log: *Causes violent city-wide tremors and a tiny explosion, appropriate for all ages.* 

Code coverage is exactly like that: it writes down what happened while the tests were running, but it cannot differentiate were the tests the direct or indirect cause of the code being executed nor was the code execution properly tested or not.

### Covered is not tested

In this example, we'll write code which is executed, but not actually tested, it will still get marked as fully covered:

^^^
```php
class Calculator
{
    public function calculate(array $values): int
    {
        $result = 0;
        foreach ($values as $value) {
            $result += $value;
        }

        return $result;
    }
}

class Formatter
{
    public function format(int $value): string
    {
        return sprintf('%.2f', $value);
    }
}

class EagerFormatterTest extends TestCase
{
    public function testExample()
    {
        $calculator = new Calculator();
        $result = $calculator->calculate([-1, 4, -3, 2]);

        $formatter = new Formatter();
        $formatted = $formatter->format($result);
        
        $this->assertEquals('2.00', $formatted);
    }
}
```
^^^ [Example]: Contrived example where we **use** the `Calculator`, but code coverage will show it as tested

If we run the test suite, we get the output:

^^^
```
App\Calculator
Methods: 100.00% ( 1/ 1)   Lines: 100.00% (  4/  4)
App\Formatter
Methods: 100.00% ( 1/ 1)   Lines: 100.00% (  1/  1)
```
^^^ [Example] code coverage output showing `Calculator` is 100% covered even though it's not tested

In this example, the code coverage tool would report a high percentage of coverage, but in reality, the `Calculator` code is basically not tested at all.

If we were to now judge the project state by code coverage alone, we'd be misled into thinking that the code is well-tested and no further work needs to be done.

### Only mark as covered what is tested

Let's fix the test to actually declare what it's testing:

^^^
```php
#[PHPUnit\Framework\Attributes\CoversClass(Formatter::class)]
class CoversFormatterTest extends TestCase
{
    public function testExample()
    {
        $calculator = new Calculator();
        $result = $calculator->calculate([-1, 4, -3, 2]);

        $formatter = new Formatter();
        $formatted = $formatter->format($result);

        $this->assertEquals('2.00', $formatted);
    }
}
```
^^^ [Example]: Same test as before, but we're making it clear that we're testing the `Formatter` only

Now, when we run the test suite, we get the output:

^^^
```
App\Formatter
  Methods: 100.00% ( 1/ 1)   Lines: 100.00% (  1/  1)
```
^^^ [Example] code coverage output showing `Formatter` is 100% covered, but `Calculator` is not mentioned anymore

A keen reader will notice this will actually **decrease** the overall code coverage percentage, but it's a more accurate representation of what's actually tested.
This decrease is actually a good thing, as we'll see in [Mutation testing](#content-mutation-testing).

#### PHPUnit-specific configuration to enforce this

We can enforce this by enabling two separate configuration options (both of which are enabled by default when generating config from scratch):

1. [`requireCoverageMetadata`](https://docs.phpunit.de/en/11.1/configuration.html#the-requirecoveragemetadata-attribute)  
    forces the test to explicitly declare what code it's covering, without it, we'll can get an error like
    ```
    1) EagerFormatterTest::testExample
       This test does not define a code coverage target but is expected to do so
    ```
2. [`beStrictAboutCoverageMetadata`](https://docs.phpunit.de/en/11.1/configuration.html#the-bestrictaboutcoveragemetadata-attribute)   
    disallows any code which is not marked as covered or used to be executed during the execution of the test:
    ```
    1) CoversFormatterTest::testExample
    This test executed code that is not listed as code to be covered or used:
    - App\Calculator
    ```
    we need to explicitly mark the code as used:
    ```php
    #[PHPUnit\Framework\Attributes\UsesClass(Calculator::class)]
    // rest of the CoversFormatterTest as before
    ```

## Break stuff

But wait! In the test, the `Calculator` actually does work so, technically, it's tested too.

Let's test this hypothesis by breaking the `Calculator` on purpose and rerunning the test suite:

^^^
```diff
-            $result *= $value;
+            $result = $value;
```
^^^ [Example]: Breaking the `Calculator` on purpose

We now know this shouldn't work, but when we run the test suite, it still passes (?) and the code coverage is still 100%?!
We've managed to break our "fully tested and 100% covered code" without any test noticing and failing, how is that even possible?

It just so happens that the test for the `Formatter` has a very simple usage of the `Calculator` and it doesn't test all the corner cases. Why should it, it's not supposed to test the `Calculator` at all.

### Mutation testing

This "break code on purpose in a controlled way, rerun the tests and see if they notice" is actually a technique called [mutation testing](https://en.wikipedia.org/wiki/Mutation_testing). It's a way to test the robustness of the tests themselves, by introducing small changes in the code and seeing if the tests catch them.
We can think of mutation testing as tests for tests, with a nice property that it's automated, and we can run it on every commit as long as we already have the tests.

Glossary:

- A "mutant" is a change to the code
- an "escaped mutant" is a mutant which no test caught
- a "killed mutant" is a mutant which was caught by a test

In our case, we can use the excellent [Infection](https://infection.github.io/) tool to run mutation testing on our codebase, it will show us our exact found mutant: 

^^^
```
1) Calculator.php:11    [M] Assignment

--- Original
+++ New
@@ @@
     {
         $result = 0;
         foreach ($values as $value) {
-            $result += $value;
+            $result = $value;
         }
         return $result;
     }
 }



6 mutations were generated:
       5 mutants were killed
       0 mutants were configured to be ignored
       0 mutants were not covered by tests
       1 covered mutants were not detected
       0 errors were encountered
       0 syntax errors were encountered
       0 time outs were encountered
       0 mutants required more time than configured

Metrics:
         Mutation Score Indicator (MSI): 83%
         Mutation Code Coverage: 100%
         Covered Code MSI: 83%
```
^^^ [Example]: Output of Infection showing the escaped mutant

In the output, we can see several interesting things:

1. it tried to modify the code in 6 different ways
2. of the 6, five were caught by our existing test, one was not, success rate 83%
3. this is the new metric we now get, Mutation Score Indicator (MSI), a measure of how well our tests are catching the mutants

### Only mutate what is covered

What does all this have to do with code coverage?

We can use the code coverage as an allow-list for the mutation testing, basically saying which parts of code we consider tested and are ready to be mutated.
It works sort of like [double-entry bookkeeping](https://en.wikipedia.org/wiki/Double-entry_bookkeeping), we have two independent ways to check if our tests are good, and if they're not, we can see where they're lacking.
If we try to inflate the code coverage by marking code as covered which is not tested, the mutation testing will catch it immediately.

> Use code coverage as opt-in for mutation testing

This principle allows us to opt in to mutation testing as we're increasing the coverage, and we can now use the coverage as a guide to see which parts of the code are not tested at all.

In our case, we'll use [`--only-covered`](https://infection.github.io/guide/command-line-options.html#only-covered) Infection flag:

^^^
```
$ vendor/bin/infection  --only-covered

(...)

1 mutations were generated:
       1 mutants were killed
(...)

Metrics:
         Mutation Score Indicator (MSI): 100%
         Mutation Code Coverage: 100%
         Covered Code MSI: 100%
```
^^^ [Example]: Output of Infection when running only on covered code

Our `Calculator` was not mutated here because we've explicitly said our tests are not testing it, meaning we can now judge the code coverage percentage as a more accurate representation of what's actually tested.

## Conclusion

Testing is hard. Judging how well we test is harder.

When we start using a metric like the code coverage percentage as our ultimate quality goal, we're optimizing for lying to ourselves about the state of our codebase quality instead of actually measuring it. 

We should strive to make the code coverage more accurate (not just as high as possible), we can keep ourselves honest about it by using mutation testing as an unbiased second opinion on how well our tests are actually testing the code.
