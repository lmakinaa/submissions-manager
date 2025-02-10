
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";
import { log } from "node:console";

export function CVForm() {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file",
          variant: "destructive",
        });
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file",
          variant: "destructive",
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    if (file) {
      formData.append("cv", file);
    }

    try {
      const response = await fetch("http://localhost:8000/apply/", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        toast({
          title: "Application Submitted",
          description: "We'll review your application and get back to you soon.",
        });
      } else {

        const errorData = await response.json();

        console.log(errorData);
        
        toast({
          title: "Submission Failed",
          description: errorData?.detail ?? "There was an error submitting your application. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {      
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-xl p-6 animate-fadeIn">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            name="full_name"
            placeholder="John Smith"
            required
            className="transition-all duration-200 focus:ring-2 focus:ring-accent"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="smith@example.com"
            required
            className="transition-all duration-200 focus:ring-2 focus:ring-accent"
          />
        </div>

        <div className="space-y-2">
          <Label>Resume/CV (PDF)</Label>
          <div
            className={`border-2 border-dashed rounded-lg p-6 transition-all duration-200 ${
              dragActive
                ? "border-accent bg-accent/5"
                : "border-gray-300 hover:border-accent"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center space-y-4">
              <Upload className="w-8 h-8 text-gray-400" />
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  {file
                    ? `Selected: ${file.name}`
                    : "Drag and drop your CV here, or click to select"}
                </p>
              </div>
              <Input
                id="cv"
                name="cv"
                type="file"
                accept=".pdf"
                onChange={handleFileInput}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("cv")?.click()}
              >
                Select File
              </Button>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-accent hover:bg-accent/90 text-white transition-all duration-200"
        >
          Submit Application
        </Button>
      </form>
    </Card>
  );
}