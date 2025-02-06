import { ArrowRight } from "lucide-react";

export default function Content() {
  return (
    <div className="mr-20 mt-20 w-[25%] h-[70%] text-right">
      <h3 className="w-1/2 border border-black rounded-full p-2 text-center text-xl mt-20 ml-auto">
        SPRING SEMESTER
      </h3>
      <h1 className="text-4xl font-bold mt-5">
        Crypto Wars: The Fight for Privacy in the Digital Age
      </h1>
      <p className="text-2xl mt-6">Guest: Kurt Pan</p>
      <p className="mt-4 mb-6">
        The crypto wars have raged for half a century. In the 1970s, digital
        privacy activists prophesied the emergence of an Orwellian State, made
        possible by computer-mediated mass surveillance. The antidote: digital
        encryption. The U.S. government warned encryption would not only prevent
        surveillance of law-abiding citizens, but of criminals, terrorists, and
        foreign spies, ushering in a rival dystopian future. Both parties fought
        to defend the citizenry from what they believed the most perilous
        threats. The government tried to control encryption to preserve its
        surveillance capabilities; privacy activists armed citizens with
        cryptographic tools and challenged encryption regulations in the courts.
      </p>
      <a href="/join" className="text-black text-xl font-bold flex justify-end">
        Sign Up to Join <ArrowRight className="ml-2" />
      </a>
    </div>
  );
}
