/*
Solution to 'Practice Section of chapter 1'
https://github.com/getify/You-Dont-Know-JS/blob/master/up%20%26%20going/ch1.md

*/

const TAX_RATE = 0.10;
const PHONE_PRICE = 89.99;
const ACCESSORY_PRICE = 9.99;
const SPENDING_THRESHOLD = 300;

const BANK_BALANCE = 350;
let cost = 0;

// buy phone until we spend more than bank balance
while (BANK_BALANCE > cost){

    // purchase phone
    cost += PHONE_PRICE;

    // purchase accessory if cost less than mental spending threshold
    if (cost < SPENDING_THRESHOLD){
        cost += ACCESSORY_PRICE;
    }
}

// add tax,
cost += calculate_tax(cost);

//format, and print to console
console.log(format_price(cost));

// print out whether you can afford it or not
if (cost < BANK_BALANCE){
    console.log('You can afford this');
}
else {
    console.log('You cannot afford this');
}

function calculate_tax(val){
    return val * TAX_RATE;
}

/*
* Formats the price into USD.
*/
function format_price(price){
    return '$' + price.toFixed(2);
}
