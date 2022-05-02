'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__value">${mov.toFixed(2)}€</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${acc.balance.toFixed(2)}€`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes.toFixed(2)}€`;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(out).toFixed(2)}€`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest.toFixed(2)}€`;
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc.movements);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

///////////////////////////////////////
// Event handlers
let currentAccount;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Update UI
    updateUI(currentAccount);
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(
    inputLoanAmount.value
  ); /*Math.floor() does type coercion so we don't need NUMBER */

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // Add movement
    currentAccount.movements.push(amount);

    // Update UI
    updateUI(currentAccount);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

/* 172 The Remainder Operator */

/* 171 Math and Rounding */

// console.log(Math.sqrt(25));
// console.log(25 ** (1 / 2));
// console.log(8 ** (1 / 3));

// console.log(Math.max(5, 18, 23, 11, 2));
// console.log(
//   Math.max(5, 18, '23', 11, 2)
// ); /* It also performs type coercion so it recognizes '23' as 23. */
// console.log(Math.max(5, 18, '23px', 11, 2)); /* Parsing does not work. */

// /* And so for example, if we wanted to calculate the radius of a circle with 10 pixels, we could do that.

// So for that, we use Math.PI. Let's say that we get 10 pixels from the user interface. So we can say parseFloat of 10 pixels (since Number.parseFloat() pulls the Integer & decimal from the string), and then we simply square this value. This is how we calculate the area of a circle with this radius. */
// console.log(Math.PI); /* Pi's constant */
// console.log(Math.PI * Number.parseFloat('10px') ** 2);

// /* Remember, so that we did by Math.random. And so this will give us a number between zero and one. So as I reload, you see, I get different values. Then we multiply this by a six. */

// console.log(Math.trunc(Math.random() * 6 + 1));

// /* Math.random generates a number between 0 and less than 1. 1 is not inclusive so that's why this works.*/
// const randomInt = (min, max) => Math.floor(Math.rondom * (max - min) + 1) + min;
// console.log(randomInt(10, 20));

// /* Rounding Integers - all these methods also perform type coercion */
// console.log(Math.trunc(23.3));

// console.log(Math.round(23.3));
// console.log(Math.round(23.9));

// console.log(Math.ceil(23.3));
// console.log(Math.ceil(23.9));

// console.log(Math.floor(23.3));
// console.log(Math.floor(23.9));

// console.log(Math.floor('23.9'));

// /* So basically floor and trunc, both cut off the decimal part when we are dealing with POSITIVE numbers. And so actually Math.floor() is a little bit better than Math.trunc() because it works in all situations, no matter if we're dealing with positive or negative numbers. The function we created (randomInt was updated with floor() from trunc().)*/

// console.log(Math.trunc(-23.3));
// console.log(Math.floor(-23.3));

// /* Rounding decimals (floating point numnbers) */

// console.log(
//   (2.7).toFixed(0)
// ); /* This will always return a string a not a number.

// So this is a number, so it's a primitive, right? And primitives actually don't have methods. And so behind the scenes, JavaScript will do boxing. And boxing is to basically transform this to a number object, then call the method on that object. And then once the operation is finished it will convert it back to a primitive, okay? */

// console.log((2.7).toFixed(3));
// console.log((2.345).toFixed(2));
// console.log(
//   +(2.345).toFixed(2)
// ); /* The plus sign performs type coercion thus changing it from a string to a number */

/* 170 Converting and Checking Numbers */

// /* All numbers are presented internally as floating point numbers so basically decimals, no matter if we actually write them as integers or as decimals. The result for this is TRUE. Also, numbers are represented internally in a 64 base 2 format.*/
// console.log(23 === 23.0);

// /* There are certain numbers that are difficult to represent in base 2 and one example is the fraction 1/10 = .1 */
// console.log(0.1 + 0.2);
// console.log(0.1 + 0.2 === 0.3);

// console.log(Number('23'));
// /* This works because when JavaScript sees the plus operator, it will do type coercion and it will automatically convert all the operands to numbers. */
// console.log(+'23');

// /* Parsing - So we can parse a number from a string. So on the Number object, which is kind of this function here, it's also an object in the end.*/
// console.log(Number.parseInt('30px'));
// /* The string needs to start with a number */
// console.log(Number.parseInt('e23'));
// /* Now, the parseInt function actually accepts a second argument, which is the so-called regex. In this instance, it is BASE 10. By specifying the BASE#, we can avoid some bugs. */
// console.log(Number.parseInt('30px', 10));
// console.log(Number.parseInt('11111111', 2));
// console.log(Number.parseInt('11111111', 10));

// /* Parse Float - Now it reads the decimal number here from our string.*/
// console.log(Number.parseFloat('2.5rem'));
// /* The integer only gets displayed and not the decimal portion of the number */
// console.log(Number.parseInt('2.5rem'));

// /*  This is the more traditional and old-school way of doing it however in modern JavaScript, it is more encouraged to call these functions actually on the Number object. So we say that Number here provides something called a namespace. */
// console.log(parseFloat('2.5rem'));
// console.log(parseInt('2.5rem'));

// /* And we can use this one to basically check if any value is a number. Well, not any value but more about that later. */
// console.log(Number.isNaN(20));
// console.log(Number.isNaN('20'));
// /* Let's try converting something. So for example, if we try to convert this string into a number, then this will be NaN. Right? And so therefore, it is true. */
// console.log(Number.isNaN(+'20X'));
// /* And so this is not a number is actually not a perfect way for checking if a value is a number because it doesn't consider this use case and sometimes, this might very well happen. */
// console.log(Number.isNaN(23 / 0)); /* The result is INFINITY */

// /* Number.IsFinite() And so this is actually better to check if something is a number or not. And so this method is the ultimate method that you should use to check if any value is a number, at least when you're working with floating point numbers.*/
// console.log(Number.isFinite(20)); /* TRUE */
// console.log(Number.isFinite('20')); /* FALSE */
// console.log(Number.isFinite(+'20x')); /* FALSE */
// console.log(Number.isFinite(23 / 0)); /* FALSE */
