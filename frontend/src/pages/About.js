import React from 'react';

const About = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-center">Biz haqimizda</h1>
      
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-semibold mb-4">Umidnoma - sizning psixologik yordamingiz</h2>
        
        <p className="text-gray-600 mb-6">
          Umidnoma - bu professional psixologlar bilan bog'lanish uchun platforma. 
          Bizning maqsadimiz - har bir insonga sifatli psixologik yordam ko'rsatish.
        </p>
        
        <h3 className="text-xl font-semibold mb-4">Nima uchun biz?</h3>
        <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
          <li>Professional va tajribali psixologlar</li>
          <li>Qulay va maxfiy muloqot</li>
          <li>Har bir mijozga individual yondashuv</li>
          <li>Zamonaviy psixologik metodlar</li>
        </ul>
        
        <h3 className="text-xl font-semibold mb-4">Bizning maqsadimiz</h3>
        <p className="text-gray-600">
          Biz har bir insonning psixologik sog'lig'ini yaxshilash va ularga 
          professional yordam ko'rsatish orqali jamiyatning umumiy farovonligiga 
          hissa qo'shishni maqsad qilganmiz.
        </p>
      </div>
    </div>
  );
};

export default About; 