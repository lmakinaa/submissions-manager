
import { CVForm } from "@/components/CVForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-white">
      <div className="container px-4 py-16 mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-12 animate-fadeIn">
          <span className="inline-block px-3 py-1 text-sm font-medium text-accent bg-accent/10 rounded-full mb-4">
            Join Our Team
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-4">
            Submit Your Application
          </h1>
          <p className="text-lg text-gray-600">
            We're excited to learn more about you. Please fill out the form below
            and upload your CV to get started.
          </p>
        </div>
        
        <div className="flex justify-center">
          <CVForm />
        </div>
      </div>
    </div>
  );
};

export default Index;