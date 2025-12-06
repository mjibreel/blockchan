import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Prove Your File's Authenticity
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          Immutable blockchain timestamping for any file. Prove ownership and verify authenticity
          with cryptographic hashing.
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            to="/stamp"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium"
          >
            Get Started
          </Link>
          <Link
            to="/verify"
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-8 py-3 rounded-lg text-lg font-medium"
          >
            Verify File
          </Link>
        </div>
      </div>

      {/* How It Works */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-[#1E2024] p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">1️⃣</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Upload File
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Select any file you want to stamp. We generate a unique cryptographic hash.
            </p>
          </div>
          <div className="bg-white dark:bg-[#1E2024] p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">2️⃣</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Stamp on Blockchain
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your file hash is permanently stored on Polygon blockchain with timestamp and
              ownership proof.
            </p>
          </div>
          <div className="bg-white dark:bg-[#1E2024] p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">3️⃣</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Verify Anytime
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Anyone can verify file authenticity by uploading the file and checking the blockchain.
            </p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white dark:bg-[#1E2024] p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
          Why Qubic File Stamp?
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex items-start">
            <div className="text-2xl mr-4">🔒</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Privacy-First
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Only file hashes are stored on-chain, never the actual file content.
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="text-2xl mr-4">⛓️</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Immutable Proof
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Once stamped, records cannot be altered or deleted. Permanent proof of ownership.
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="text-2xl mr-4">💰</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Low Cost
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Using Polygon network for near-zero gas fees, making it affordable for everyone.
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="text-2xl mr-4">🌐</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Decentralized
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                No single point of failure. Your proof exists on a decentralized blockchain network.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;

