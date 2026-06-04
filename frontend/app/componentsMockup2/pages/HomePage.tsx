import AnnouncementBar from '../components/AnnouncementBar';
import HeroSection from '../components/HeroSection';
import ReassuranceStrip from '../components/ReassuranceStrip';
import FeatureProduct from '../components/FeatureProduct';
import BenefitsGrid from '../components/BenefitsGrid';
import HowItWorks from '../components/HowItWorks';
import MineralComposition from '../components/MineralComposition';
import SocialProof from '../components/SocialProof';
import EducationSection from '../components/EducationSection';
//import VideoReels from '../components/VideoReels';
import VideoReelsIframe from '../components/VideoReelsIframe';
import CommunityCallout from '../components/CommunityCallout';

export default function HomePage() {
  return (
    <>
      <AnnouncementBar />
      <HeroSection />
      <ReassuranceStrip />
      <BenefitsGrid />
      <HowItWorks />
      <MineralComposition />
      <SocialProof />
      <EducationSection />
      <VideoReelsIframe />
      <CommunityCallout />
    </>
  );
}
