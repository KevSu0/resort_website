import React, { useState, useEffect } from 'react';
import { Gift, Users, Star, Copy, Check } from 'lucide-react';
import { referralService } from '../lib/firestore';
import { Referral } from '../types';

export function ReferralBanner() {
  const [userReferral, setUserReferral] = useState<Referral | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserReferral = async () => {
      try {
        // In a real app, get current user ID from auth context
        const userId = 'current-user-id'; // Placeholder
        const referrals = await referralService.getByUser(userId);
        const referral = referrals[0]; // Get the first referral for this user
        setUserReferral(referral);
      } catch (error) {
        console.error('Error loading referral data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserReferral();
  }, []);

  const handleCopyCode = async () => {
    if (userReferral?.referral_code) {
      try {
        await navigator.clipboard.writeText(userReferral.referral_code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy referral code:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse flex items-center justify-center">
            <div className="h-6 bg-white bg-opacity-20 rounded w-64"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-600 to-blue-600 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center text-white">
          <div className="flex items-center justify-center mb-4">
            <Gift className="w-8 h-8 mr-3" />
            <h2 className="text-2xl font-bold">
              Refer Friends & Earn Rewards
            </h2>
          </div>
          
          <p className="text-lg mb-6 text-purple-100">
            Share your love for luxury travel and get rewarded for every successful referral
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <Users className="w-8 h-8 mx-auto mb-2 text-purple-200" />
              <h3 className="font-semibold mb-1">Share Your Code</h3>
              <p className="text-sm text-purple-100">
                Invite friends with your unique referral code
              </p>
            </div>
            
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <Star className="w-8 h-8 mx-auto mb-2 text-purple-200" />
              <h3 className="font-semibold mb-1">They Save Money</h3>
              <p className="text-sm text-purple-100">
                Friends get 10% off their first booking
              </p>
            </div>
            
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <Gift className="w-8 h-8 mx-auto mb-2 text-purple-200" />
              <h3 className="font-semibold mb-1">You Earn Rewards</h3>
              <p className="text-sm text-purple-100">
                Get $100 credit for each successful referral
              </p>
            </div>
          </div>

          {userReferral ? (
            <div className="bg-white bg-opacity-10 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="font-semibold mb-4">Your Referral Stats</h3>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-purple-100">Your Code:</span>
                <div className="flex items-center space-x-2">
                  <code className="bg-white bg-opacity-20 px-3 py-1 rounded font-mono text-lg">
                    {userReferral.referral_code}
                  </code>
                  <button
                    onClick={handleCopyCode}
                    className="p-2 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition-colors"
                    title="Copy referral code"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-300" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-2xl font-bold">{userReferral.successful_referrals}</div>
                  <div className="text-purple-100">Successful Referrals</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">${userReferral.total_rewards}</div>
                  <div className="text-purple-100">Total Rewards</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-md mx-auto">
              <button className="bg-white text-purple-600 font-semibold px-8 py-3 rounded-lg hover:bg-purple-50 transition-colors">
                Get Your Referral Code
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}