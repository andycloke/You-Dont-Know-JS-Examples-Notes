/* Chapter 1: ES? Now & Future
Notes and example code from ch1 of the ES6 & Beyond book in the YDKJS series
https://github.com/getify/You-Dont-Know-JS/blob/master/es6%20%26%20beyond/ch1.md

--------------------------------------------------------------------------------

Versions:
- ECMAScript (ES) is the official name for JavaScript.
- ES1 & ES2 were not widely implemented/ known about.
- ES3 was the first widespead 'baseline' for JavaScript.
- ES4 never happened for political reasons.
- ES5 was finalised in 2009 and set the standard for the modern boom in JS popularity.
- ES2015 / ES6 was released in 2015.
    - Late in the timeline of its development, the name was changed to ES2015 from ES6.
    - Just rememeber that they are the same thing, and that future versions of JS will
    have this naming convention, baased on the year of release.
- New features are now proposed, implemented by some browsers and tested by some developers
very rapidly, so we should perhaps think of the future of JS versioning as per-feature
rather than per-year/ larger collection of features/ version.

Transpiling
- We used to wait around for old browsers to update/ drop out of use before implementing new
features, but this slows the evolution of the language by a few years.
- Now we use transpilers (transformer + compiler) to transform your ES6 code into code that
works in pre-ES6 (largely ES5) environments.

Shims/ Polyfills
- Polyfills (shims) are a pattern for defining equivalent behaviour from a newer environment into an
older environment.
- Syntax cannot be polyfilled, but APIs often can be.
- There are collections of polyfills you should use, such as those listed here: https://github.com/paulmillr/es6-shim/
- For example, `Object.is(..)` is a new utility for checking strict equality of two values. It improves
upon `===` by not having the wierd exceptions that 'NaN !== NaN' and '-0 === 0'. Here is how we polyfill it:
*/
if (!Object.is) {       // guard ensures we only define this behaviour for older enviroments
    Object.is = function(v1,v1) {
        // test for `-0`
        if (v1 === 0 && v2 === 0) {
            return 1 / v1 === 1 / v2;
        }
        // test for `NaN`
        if (v1 !== v1) {
            return v2 !== v2;
        }
        // everything else
        return v1 === v2;
    };
}
