// src/pages/Home.jsx
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import GameModes from '../components/GameMode';
import Features from '../components/Features';
import Navbar from '../components/Navbar';
import Leaderboards from "../components/Leaderboards";
import FAQ from "../components/FAQ";
import Footer from '../components/Footer';


const Home = () => {
  return (
    <div>
      <Navbar />
      <Hero />
      <HowItWorks />
      <GameModes />
      <Features />

      <Leaderboards />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Home;
