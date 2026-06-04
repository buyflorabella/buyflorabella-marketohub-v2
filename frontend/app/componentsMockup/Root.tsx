import HeroSection from './HeroSection';
import ReassuranceStrip from './ReassuranceStrip';
import FeatureProduct from './FeatureProduct';
import HowItWorks from './HowItWorks';
import BenefitsGrid from './BenefitsGrid';
import MineralComposition from './MineralComposition';
import SocialProof from './SocialProof';
import VideoReels from './VideoReels';
import EducationSection from './EducationSection';
import CommunityCallout from './CommunityCallout';
import { useState } from 'react';
import { useLoaderData } from 'react-router';

export const LandingPage = () => {
  const { STORE_PASSWORD, PUBLIC_STORE_LOCKED } = useLoaderData().env;
  const [passwordLocked, setPasswordLocked] = useState(PUBLIC_STORE_LOCKED === "true");
  const [password, setPassword] = useState('')

  if (passwordLocked) {
    return <div style={{
      padding: '5rem',
      margin: '5rem',
      color: 'black',
      alignSelf: 'center',
      textAlign: 'center',
    }}>
      <label htmlFor='password' style={{color: 'white'}}> Password </label>
      <input type='text' id='password' value={password} onChange={(e) => setPassword(e.target.value)} />
      <br />
      <button style={{
        padding: '2px',
        borderRadius: '2px',
        backgroundColor: 'white'
      }} onClick={() => setPasswordLocked(password !== STORE_PASSWORD)}>
        Submit
      </button>
    </div>
  }

  return (
      <main>
        <HeroSection />
        <ReassuranceStrip />
        <FeatureProduct />
        <HowItWorks />
        <BenefitsGrid />
        <MineralComposition />
        <SocialProof />
        <VideoReels />
        <EducationSection />
        <CommunityCallout />
      </main>
  );
}
