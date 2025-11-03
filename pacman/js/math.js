const mathSets = [
  {
    sentence: "A basket contains 48 apples and 32 oranges. What is the greatest number of equal fruit baskets that can be made without leftovers?",
    correct: "16 bskts",
    incorrect: ["6 bskts", "8 bskts", "12 bskts"]
  },
  {
    sentence: "A train leaves Lagos at 10:15 AM and arrives in Abuja at 4:45 PM. How long was the journey?",
    correct: "6 hrs 30 mins",
    incorrect: ["5 hrs 30 mins", "7 hrs 30 mins", "8 hrs 30 mins"]
  },
  {
    sentence: "A school field is in the shape of a rectangle measuring 80 m by 50 m. What is its area?",
    correct: "4,000 m²",
    incorrect: ["1,500 m²", "130 m²", "400 m²"]
  },
  {
    sentence: "What is the missing number in the sequence: 125, 150, ___, 200, 225?",
    correct: "175",
    incorrect: ["160", "170", "180"]
  },
  {
    sentence: "Convert 3.625 to a fraction in its simplest form.",
    correct: "3 ⅝",
    incorrect: ["3 ⅖", "3 ⅞", "3 ⁹⁄₁₆"]
  },
  {
    sentence: "A trader bought a bag of rice for ₦18,500 and sold it for ₦22,000. What was her profit?",
    correct: "₦3,500",
    incorrect: ["₦4,500", "₦5,000", "₦3,000"]
  },
  {
    sentence: "The product of two consecutive prime numbers is 77. What is the sum of the two numbers?",
    correct: "18",
    incorrect: ["17", "20", "22"]
  },
  {
    sentence: "What is the place value of 7 in 4,276,308?",
    correct: "Ten thousand",
    incorrect: ["Hundred thousand", "Million", "Thousand"]
  },
  {
    sentence: "Simplify: (24 ÷ 4) + (9 × 2) - 5",
    correct: "19",
    incorrect: ["22", "21", "23"]
  },
  {
    sentence: "How many 250ml cups of water are needed to fill a 5-liter container?",
    correct: "20 cups",
    incorrect: ["10 cups", "15 cups", "25 cups"]
  },
  {
    sentence: "If 40% of a class of 50 students are boys, how many girls are in the class?",
    correct: "30 girls",
    incorrect: ["25 girls", "20 girls", "15 girls"]
  },
  {
    sentence: "The sum of three consecutive odd numbers is 51. What is the largest number?",
    correct: "18",
    incorrect: ["15", "17", "21"]
  },
  {
    sentence: "Express ₦100 as a fraction of ₦500 in the simplest form.",
    correct: "⅕",
    incorrect: ["⅖", "¼", "⅓"]
  },
  {
    sentence: "A trader sells a radio for ₦9,000 after a 10% discount. What was the original price?",
    correct: "₦10,000",
    incorrect: ["₦10,500", "₦9,500", "₦11,000"]
  },
  {
    sentence: "Find the missing angle in a triangle with angles 75° and 55°.",
    correct: "50°",
    incorrect: ["45°", "55°", "60°"]
  },
  {
    sentence: "Convert XLVII to Arabic numerals.",
    correct: "47",
    incorrect: ["37", "57", "67"]
  },
  {
    sentence: "A bus covers 225 km in 5 hours. What is its average speed?",
    correct: "45 km/h",
    incorrect: ["50 km/h", "55 km/h", "60 km/h"]
  },
  {
    sentence: "Find the LCM of 12 and 18.",
    correct: "36",
    incorrect: ["24", "48", "54"]
  },
  {
    sentence: "If 7 is subtracted from twice a number, the result is 19. What is the number?",
    correct: "13",
    incorrect: ["12", "14", "15"]
  },
  {
    sentence: "What is the probability of getting an even number when rolling a fair six-sided die?",
    correct: "½",
    incorrect: ["⅙", "⅓", "⅔"]
  },
  {
    sentence: "Convert 25% to a decimal.",
    correct: "0.25",
    incorrect: ["0.025", "2.5", "25"]
  },
  {
    sentence: "The perimeter of a square is 48 cm. What is its area?",
    correct: "144 cm²",
    incorrect: ["256 cm²", "64 cm²", "100 cm²"]
  },
  {
    sentence: "The sum of the ages of a mother and her daughter is 48. If the mother is three times the daughter's age, how old is the daughter?",
    correct: "12 years",
    incorrect: ["15 years", "18 years", "21 years"]
  },
  {
    sentence: "Convert 1011₂ to decimal.",
    correct: "11",
    incorrect: ["9", "10", "12"]
  },
  {
    sentence: "A bottle holds 1.5 liters of water. How many milliliters is this?",
    correct: "1,500 ml",
    incorrect: ["150 ml", "15,000 ml", "150,000 ml"]
  },
  {
    sentence: "How many degrees are in the sum of the angles on a straight line?",
    correct: "180°",
    incorrect: ["90°", "120°", "150°"]
  },
  {
    sentence: "A father is twice as old as his son. If the sum of their ages is 54, how old is the son?",
    correct: "18 years",
    incorrect: ["20 years", "22 years", "24 years"]
  },
  {
    sentence: "Solve for x: 5x - 7 = 23",
    correct: "6",
    incorrect: ["4", "5", "7"]
  },
  {
    sentence: "What is the smallest prime number greater than 50?",
    correct: "53",
    incorrect: ["51", "55", "57"]
  },
  {
    sentence: "Estimate 6,832 ÷ 47 by rounding the numbers to the nearest tens before dividing.",
    correct: "150",
    incorrect: ["140", "160", "170"]
  },
  {
    sentence: "A car uses 8 liters of fuel to travel 100 km. How many liters will it need to travel 250 km?",
    correct: "20 L",
    incorrect: ["16 L", "18 L", "25 L"]
  },
  {
    sentence: "A school bought 378 chairs. Approximate this number to the nearest ten.",
    correct: "380",
    incorrect: ["370", "375", "400"]
  },
  {
    sentence: "The length of a rectangle is twice its width. If the perimeter is 36 cm, what is the width?",
    correct: "6 cm",
    incorrect: ["8 cm", "9 cm", "10 cm"]
  },
  {
    sentence: "A shopkeeper sold a television for ₦48,000 at a loss of 20%. What was the cost price?",
    correct: "₦60,000",
    incorrect: ["₦56,000", "₦58,000", "₦62,000"]
  },
  {
    sentence: "Find the cube root of 1,728.",
    correct: "12",
    incorrect: ["10", "14", "16"]
  },
  {
    sentence: "A bus leaves at 7:40 AM and arrives at 3:55 PM. How long is the journey?",
    correct: "8 hrs 15 mins",
    incorrect: ["6 hrs 15 mins", "7 hrs 5 mins", "8 hrs 45 mins"]
  },
  {
    sentence: "What is the sum of all the even numbers between 20 and 30?",
    correct: "120",
    incorrect: ["100", "150", "180"]
  },
  {
    sentence: "Convert 2.75 to a fraction in the simplest form.",
    correct: "2 ¾",
    incorrect: ["2 ¼", "2 ⅓", "2 ½"]
  },
  {
    sentence: "The mean of five numbers is 18. If four of the numbers are 15, 17, 19, and 21, what is the fifth number?",
    correct: "18",
    incorrect: ["16", "20", "22"]
  },
  {
    sentence: "A man deposited ₦50,000 in a bank at 5% simple interest per year. How much will the interest be after 3 years?",
    correct: "₦7,500",
    incorrect: ["₦8,000", "₦9,000", "₦10,000"]
  },
  {
    sentence: "How many faces does a cube have?",
    correct: "6",
    incorrect: ["4", "8", "10"]
  },
  {
    sentence: "A mother shares ₦2,400 among her 3 children in the ratio 3:2:1. How much does the eldest child get?",
    correct: "₦1,200",
    incorrect: ["₦600", "₦800", "₦1,400"]
  },
  {
    sentence: "If 36 pencils cost ₦900, how much will 50 pencils cost?",
    correct: "₦1,250",
    incorrect: ["₦1,150", "₦1,200", "₦1,300"]
  },
  {
    sentence: "The probability of getting a head when flipping a fair coin is ___.",
    correct: "½",
    incorrect: ["¼", "¾", "1"]
  },
  {
    sentence: "Find the missing number: 4, 9, 16, ___, 36, 49.",
    correct: "25",
    incorrect: ["20", "23", "27"]
  },
  {
    sentence: "A father is three times as old as his son. If the father is 45 years old, how old is the son?",
    correct: "15 years",
    incorrect: ["12 years", "13 years", "14 years"]
  },
  {
    sentence: "A farmer has 105 mangoes and 75 oranges. What is the highest number of equal groups he can make?",
    correct: "15",
    incorrect: ["10", "25", "30"]
  },
  {
    sentence: "The sum of two numbers is 92, and their difference is 28. What is the smaller number?",
    correct: "32",
    incorrect: ["30", "35", "38"]
  },
  {
    sentence: "Find the next number in the sequence: 3, 8, 15, 24, ___.",
    correct: "35",
    incorrect: ["30", "32", "39"]
  },
  {
    sentence: "What is the perimeter of a triangle with sides 7 cm, 9 cm, and 12 cm?",
    correct: "28 cm",
    incorrect: ["25 cm", "30 cm", "32 cm"]
  },
  {
    sentence: "A shopkeeper increases the price of a dress from ₦2,000 to ₦2,400. What is the percentage increase?",
    correct: "20%",
    incorrect: ["15%", "25%", "30%"]
  },
  {
    sentence: "What is the value of X in the equation 3X + 4 = 19?",
    correct: "5",
    incorrect: ["4", "6", "7"]
  },
  {
    sentence: "Convert 105₁₀ to Roman numerals.",
    correct: "CV",
    incorrect: ["CVC", "CLV", "CXV"]
  },
  {
    sentence: "What is the sum of the first five odd numbers?",
    correct: "25",
    incorrect: ["20", "30", "35"]
  },
  {
    sentence: "A goat eats 3 kg of grass per day. How many kilograms will it eat in 15 days?",
    correct: "45 kg",
    incorrect: ["30 kg", "35 kg", "40 kg"]
  },
  {
    sentence: "The sum of two consecutive even numbers is 38. What is the larger number?",
    correct: "20",
    incorrect: ["16", "18", "22"]
  },
  {
    sentence: "If a = 5 and b = 3, find the value of (a² - b²).",
    correct: "16",
    incorrect: ["10", "15", "25"]
  },
  {
    sentence: "A shopkeeper gave a 15% discount on a ₦6,000 bag. How much did the customer pay?",
    correct: "₦5,100",
    incorrect: ["₦4,900", "₦5,300", "₦5,500"]
  },
  {
    sentence: "The smallest composite number is ___.",
    correct: "4",
    incorrect: ["2", "3", "5"]
  }
];

export default mathSets