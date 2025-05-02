import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-20">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Psixologik yordam - sizning hayotingiz uchun
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Professional psixologlar bilan muloqot qiling va hayotingizni yaxshilang
        </p>
        <Link
          to="/psychologists"
          className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition duration-300"
        >
          Psixologlarni ko'rish
        </Link>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Professional yordam</h3>
          <p className="text-gray-600">
            Tajribali psixologlar sizga professional yordam ko'rsatishadi
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Qulaylik</h3>
          <p className="text-gray-600">
            O'zingizga qulay vaqtda psixolog bilan muloqot qiling
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Maxfiylik</h3>
          <p className="text-gray-600">
            Barcha suhbatlar maxfiy saqlanadi va himoyalanadi
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-16 bg-indigo-50 rounded-lg">
        <h2 className="text-3xl font-bold mb-6">Yordamga muhtojmisiz?</h2>
        <p className="text-xl text-gray-600 mb-8">
          Bizning psixologlarimiz sizga yordam berishga tayyor
        </p>
        <Link
          to="/psychologists"
          className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition duration-300"
        >
          Psixologlarni ko'rish
        </Link>
      </section>
    </div>
  );
};

export default Home; 