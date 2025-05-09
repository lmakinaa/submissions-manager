
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { api, FormResponse, FormField } from "@/services/api";
import { handleApiError } from "@/services/api";
import { Upload } from "lucide-react";

interface FieldWithType extends FormField {
  type: string;
  name: string;
  id: number;
}

const ApplicationForm = () => {
  const { formId } = useParams<{ formId: string }>();
  const [form, setForm] = useState<FormResponse | null>(null);
  const [formFields, setFormFields] = useState<FieldWithType[]>([]);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load form data
  useEffect(() => {
    const loadForm = async () => {
      if (!formId) return;
      
      try {
        setIsLoading(true);
        const formData = await api.forms.get(parseInt(formId));
        setForm(formData);
        
        // Transform field_config to a more usable format for the UI
        const fieldsWithTypes = formData.field_config.map((field, index) => ({
          ...field,
          type: getFieldTypeFromId(field.field_type_id),
          name: field.label,
          id: index
        }));
        setFormFields(fieldsWithTypes);
        
        // Initialize form values
        const initialValues: Record<string, any> = {};
        fieldsWithTypes.forEach(field => {
          initialValues[field.field_id] = field.type === 'checkbox' ? false : '';
        });
        setFormValues(initialValues);
        
        // Initialize files
        const initialFiles: Record<string, File | null> = {};
        fieldsWithTypes.filter(field => field.type === 'file').forEach(field => {
          initialFiles[field.field_id] = null;
        });
        setFiles(initialFiles);
      } catch (error) {
        handleApiError(error);
        // Redirect to not found page if form doesn't exist
        navigate("/not-found");
      } finally {
        setIsLoading(false);
      }
    };

    loadForm();
  }, [formId, navigate]);

  // Helper function to map field_type_id to readable types
  const getFieldTypeFromId = (typeId: number): string => {
    // This is a simple mapping - you might want to fetch actual field types from the API
    switch(typeId) {
      case 1: return 'text';
      case 2: return 'textarea';
      case 3: return 'email';
      case 4: return 'checkbox';
      case 5: return 'file';
      default: return 'text';
    }
  };

  const handleInputChange = (fieldId: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleFileChange = (fieldId: string, file: File | null) => {
    setFiles(prev => ({
      ...prev,
      [fieldId]: file
    }));
  };

  const handleFileInputChange = (fieldId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(fieldId, e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (fieldId: string, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(fieldId, e.dataTransfer.files[0]);
    }
  };

  const validateForm = () => {
    if (!form) return false;
    
    // Check required fields
    for (const field of formFields) {
      if (field.required) {
        if (field.type === 'file') {
          if (!files[field.field_id]) {
            toast({
              title: "Validation Error",
              description: `${field.name} is required`,
              variant: "destructive",
            });
            return false;
          }
        } else if (!formValues[field.field_id]) {
          toast({
            title: "Validation Error",
            description: `${field.name} is required`,
            variant: "destructive",
          });
          return false;
        }
      }
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !form || !formId) return;
    
    setIsSubmitting(true);
    
    try {
      // Create FormData object for API submission
      const uploadedFiles = Object.entries(files)
      .filter(([, file]) => Boolean(file)) // Filter out null or undefined files
      .map(([fieldId, file]) => {
        if (file) {
          // Create a new File object with the field_id prepended to the filename
          return new File([file], `${fieldId}___${file.name}`, { type: file.type });
        }
        return null;
      })
      .filter(Boolean) as File[]; // Ensure the result is a list of valid File objects
      
      
      const formDataToSubmit = {
        form_data: JSON.stringify(formValues),
        files: uploadedFiles
      };
      
      // Submit application
      await api.applications.submit(parseInt(formId), formDataToSubmit);
      
      toast({
        title: "Application Submitted",
        description: "Your application has been submitted successfully.",
      });
      
      // Redirect to success page or home
      navigate("/");
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading application form...</p>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Form not found.</p>
      </div>
    );
  }

  const renderField = (field: FieldWithType) => {
    switch (field.type.toLowerCase()) {
      case 'text':
        return (
          <Input
            id={`field-${field.field_id}`}
            value={formValues[field.field_id] || ''}
            onChange={(e) => handleInputChange(field.field_id, e.target.value)}
            required={field.required}
          />
        );
      
      case 'email':
        return (
          <Input
            id={`field-${field.field_id}`}
            type="email"
            value={formValues[field.field_id] || ''}
            onChange={(e) => handleInputChange(field.field_id, e.target.value)}
            required={field.required}
          />
        );
      
      case 'textarea':
        return (
          <Textarea
            id={`field-${field.field_id}`}
            value={formValues[field.field_id] || ''}
            onChange={(e) => handleInputChange(field.field_id, e.target.value)}
            required={field.required}
          />
        );
      
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`field-${field.field_id}`}
              checked={!!formValues[field.field_id]}
              onCheckedChange={(checked) => 
                handleInputChange(field.field_id, checked === true)
              }
              required={field.required}
            />
            <Label htmlFor={`field-${field.field_id}`}>
              {field.name}
            </Label>
          </div>
        );
      
      case 'file':
        return (
          <div
            className={`border-2 border-dashed rounded-lg p-6 transition-all duration-200 ${
              files[field.field_id]
                ? "border-accent bg-accent/5"
                : "border-gray-300 hover:border-accent"
            }`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(field.field_id, e)}
          >
            <div className="flex flex-col items-center space-y-4">
              <Upload className="w-8 h-8 text-gray-400" />
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  {files[field.field_id]
                    ? `Selected: ${files[field.field_id]?.name}`
                    : "Drag and drop your file here, or click to select"}
                </p>
              </div>
              <Input
                id={`field-${field.field_id}`}
                type="file"
                onChange={(e) => handleFileInputChange(field.field_id, e)}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const element = document.getElementById(`field-${field.field_id}`);
                  if (element) {
                    (element as HTMLInputElement).click();
                  }
                }}
              >
                Select File
              </Button>
            </div>
          </div>
        );
      
      default:
        return (
          <Input
            id={`field-${field.field_id}`}
            value={formValues[field.field_id] || ''}
            onChange={(e) => handleInputChange(field.field_id, e.target.value)}
            required={field.required}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <Card className="animate-fadeIn">
          <CardHeader className="text-center">
            <h1 className="text-2xl font-bold">{form.title}</h1>
            {form.description && (
              <p className="text-muted-foreground mt-2">{form.description}</p>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {formFields.map(field => (
                <div key={field.field_id} className="space-y-2">
                  {field.type !== 'checkbox' && (
                    <Label htmlFor={`field-${field.field_id}`}>
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </Label>
                  )}
                  {renderField(field)}
                </div>
              ))}
              
              <Button
                type="submit"
                className="w-full mt-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-6">
            <p className="text-sm text-muted-foreground">
              Thank you for your interest in applying for this position
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ApplicationForm;
