import { Hero } from '@/components/hero';
import Footer from '@/components/footer';
import PremiumPicker from '@/components/premiumpicker';
import Nav from '@/components/nav';
import Question from '@/components/question';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col items-center">
        <div className="flex-1 w-full flex flex-col gap-20">
          <Hero />
        </div>
        <PremiumPicker />
        <Question />
      </div>
    </main>
  );
}
