import { useState } from 'react';
import React from 'react';
import ProfileModal from '@/components/ProfileModal';

export default function ProfileModalExample() {
  const [profile, setProfile] = useState({
    name: "John Doe",
    profession: "Investor",
    whatsappNumber: "+91 98765 43210",
  });

  return (
    <ProfileModal
      isOpen={true}
      onClose={() => console.log('Close modal')}
      profile={profile}
      onSave={(newProfile) => {
        console.log('Save profile:', newProfile);
        setProfile(newProfile);
      }}
    />
  );
}
