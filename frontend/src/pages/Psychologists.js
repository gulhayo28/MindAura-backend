import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Psychologists = () => {
  const [psychologists, setPsychologists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPsychologists = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/psychologists');
        setPsychologists(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching psychologists:', error);
        setLoading(false);
      }
    };

    fetchPsychologists();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Yuklanmoqda...</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-center">Bizning psixologlarimiz</h1>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {psychologists.map((psychologist) => (
          <div key={psychologist._id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                {psychologist.image ? (
                  <img
                    src={psychologist.image}
                    alt={psychologist.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl text-gray-500">
                    {psychologist.name.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold">{psychologist.name}</h3>
                <p className="text-gray-600">{psychologist.specialization}</p>
              </div>
            </div>
            
            <p className="text-gray-600 mb-4">{psychologist.description}</p>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">
                  Tajriba: {psychologist.experience} yil
                </p>
                <p className="text-sm text-gray-500">
                  Reyting: {psychologist.rating}/5
                </p>
              </div>
              <a
                href={`tel:${psychologist.phone}`}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-300"
              >
                Qo'ng'iroq qilish
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Psychologists; 