import React, { useState } from 'react';

const faqData = [
  {
    question: "What is Ezabay?",
    answer: "Ezabay is a user-friendly cryptocurrency exchange that allows users to buy, sell, and manage Hive, HBD, and other digital assets. It simplifies the process for those who want to access the Hive ecosystem, including SpendHBD and Distraitor, where Hive and HBD can be spent or used for rewards.",
  },
  {
    question: "How do I create an account?",
    answer: "Creating an account on Ezabay is easy. Click on the 'Register' button, provide your details, and verify your email address. Once you're done, you'll be ready to buy Hive, HBD, and other cryptocurrencies right away.",
  },
  {
    question: "How can I buy Hive and HBD?",
    answer: "Buying Hive and HBD on Ezabay is straightforward. After creating an account, simply go to the trading section, choose Hive or HBD, and make your purchase using supported payment methods.",
  },
  {
    question: "Are there any fees for trading on Ezabay?",
    answer: "Ezabay offers competitive trading fees, especially for Hive and HBD. Our platform has low fees to make sure your trading experience is affordable, with discounts available for high-volume traders.",
  },
  {
    question: "Can I use Hive and HBD outside of trading?",
    answer: "Yes, Hive and HBD can be used on platforms like SpendHBD to make purchases and on Distraitor to participate in community rewards and projects. Ezabay makes it easy to access these platforms by providing a seamless way to buy and manage Hive and HBD.",
  },
  {
    question: "Is Ezabay a secure platform?",
    answer: "Security is our top priority. Ezabay uses advanced measures such as two-factor authentication (2FA), encrypted transactions, and secure storage of assets to protect your funds at all times.",
  }
];

const FAQSection = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(prev => (prev === index ? null : index));
  };

  return (
    <section id="faq" className="faq">
      <div className="container">
        <div className="">
          <h2 className="section-title">Frequently Asked Questions</h2>
        </div>

        <div className="faq-container">
          {faqData.map((item, index) => (
            <div
              key={index}
              className={`faq-item  ${activeIndex === index ? 'active' : ''}`}
            >
              <div className="faq-question" onClick={() => toggleFAQ(index)}>
                {item.question}
                <span className="faq-toggle">+</span>
              </div>
              <div className="faq-answer">{item.answer}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
