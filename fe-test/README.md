# OFX Frontend Coding Test
Before users make payments or conversions in OFX, we provide them with a simple calculator to show them how much they will receive when complete.

The code provided to you includes a simple calculator with some of it's implementation missing or incomplete. For this test you'll be extending the provided code to be more complete.

The test is designed to take at most 1hr 30mins at most.
  
## Question 1
There are two drop down boxes on the main screen that open when clicked. Modify both dropdowns to close when you click anywhere outside of the dropdown.
  
## Question 2
Create a new text input component and add it to the rates page. The user will be using this input to enter the amount they want to convert.
  
## Question 3
Using the current rate and whatever the user enters into the input box, calculate what the result of the conversion would be, including an OFX markup of 0.05% (Calculation instructions are below). Display both the 'true' amount (i.e. the amount without markup) and the marked up amount on the page.

### Calculating Markup
You can think of markup as the difference between the amount the user receives on the conversion and the rate OFX actually trades at.
  
Whenever you convert your money, a margin is added by the company doing the conversion for you, but it's usually hidden.

The markup is typically given as a percentage (in this case 0.5%), and is used to calculate an adjustment to the actual rate. Ultimately it determines the difference between the market rate and the rate you actually get.

#### Example 1
If you are selling AUD and buying SGD, the exchange rate may be 1.00. The markup on the FX is 0.5%, which means we want to adjust the rate by  `0.005 * 1.00 = 0.005`, which makes the OFX rate `1.00 - 0.005 = 99.995`.
  
#### Example 2
If you are selling AUD and buying INR, the exchange rate may be 50.00. The mark up on the FX is 0.5%, which means we want to adjust the rate by `0.005 * 50 = 0.25`, which makes the OFX rate `50 - 0.25 = 49.75`.


## Question 4
The currency markets are constantly moving and changing. OFX provides users with an API to fetch live rates from the market.
  
Update your page to fetch the live rate from OFX and display it to the user. Each time the blue bar on the page reaches the end, you should fetch that rate again.

The following API docs page describes how to use the endpoint: https://apidocs.paytron.com/reference/get-rates. In the response body you should use the `retailRate` value to display on your page.
  
**Note:** You will need to use the following URL instead of the production one: https://rates.staging.api.paytron.com/rate/public
