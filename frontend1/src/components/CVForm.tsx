
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";
import { api, ApplicationSubmit } from "@/services/api";
import { handleApiError } from "@/services/api";

interface CVFormProps {
  formId: number;
  onSubmitSuccess?: () => void;
}

export function CVForm({ formId, onSubmitSuccess }: CVFormProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    
    if (!file) {
      toast({
        title: "Missing Resume",
        description: "Please upload your resume before submitting",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Prepare form data for submission according to API requirements
      const formData: ApplicationSubmit = {
        form_data: JSON.stringify({
          fullName: fullName,
          email: email,
          coverLetter: coverLetter
        }),
        files: [file]
      };
      
      await api.applications.submit(formId, formData);
      
      toast({
        title: "Application Submitted",
        description: "We'll review your application and get back to you soon.",
      });
      
      // Reset form
      setFullName("");
      setEmail("");
      setCoverLetter("");
      setFile(null);
      
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-xl p-6 animate-fadeIn">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Doe"
            required
            className="transition-all duration-200 focus:ring-2 focus:ring-accent"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            required
            className="transition-all duration-200 focus:ring-2 focus:ring-accent"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="coverLetter">Cover Letter</Label>
          <Textarea
            id="coverLetter"
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="Tell us why you're interested in this position..."
            className="min-h-[120px] transition-all duration-200 focus:ring-2 focus:ring-accent"
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
                type="file"
                accept=".pdf"
                onChange={handleFileInput}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const element = document.getElementById("cv");
                  if (element) {
                    (element as HTMLInputElement).click();
                  }
                }}
              >
                Select File
              </Button>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-accent hover:bg-accent/90 text-white transition-all duration-200"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Application"}
        </Button>
      </form>
    </Card>
  );
}
