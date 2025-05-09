
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink } from "lucide-react";
import { ApplicationResponse } from "@/services/api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { api, handleApiError } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface ApplicationDetailsDialogProps {
  application: ApplicationResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formFields?: any[];
}

export function ApplicationDetailsDialog({
  application,
  open,
  onOpenChange,
  formFields = []
}: ApplicationDetailsDialogProps) {
  const { toast } = useToast();

  if (!application) {
    return null;
  }

  const formData = typeof application.form_data === "string" ?
    JSON.parse(application.form_data) : application.form_data;

  const handleDownloadFile = async (fieldId: string) => {
    try {
      const fileBlob = await api.applications.downloadFile(application.id, fieldId);

      // Create a download link
      const url = window.URL.createObjectURL(fileBlob);
      const link = document.createElement('a');
      link.href = url;
      const fileName = fieldId === 'resume' ? `resume-${application.id}.pdf` : `file-${fieldId}-${application.id}`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      if (link instanceof HTMLElement) {
        link.click();
      }

      // Clean up
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Complete",
        description: "File downloaded successfully",
      });
    } catch (error) {
      handleApiError(error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      <div className="flex flex-col">
        <span>{date.toLocaleDateString()}</span>
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(date, { addSuffix: true })}
        </span>
      </div>
    );
  };

  // Find all file type fields from the form fields
  const fileFields = formFields.filter(field =>
    field.field_type_id === 5 || // Assuming field_type_id 5 is file upload
    field.field_id === 'resume' ||
    field.field_type_id === 6 // Or any other file type ID you might have
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center justify-between">
            <span>Application Details</span>
            <Badge variant={application.status === "approved" ? "default" :
              application.status === "rejected" ? "destructive" : "outline"}>
              {application.status || "Pending"}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Submitted {formatDate(application.created_at)}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-3">
          <div className="space-y-6">
            {Object.entries(formData).map(([key, value]) => {
              // Find matching field from form fields if available
              const field = formFields.find(f => f.field_id === key);
              const fieldName = field ? field.label : key;

              return (
                <div key={key} className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">{fieldName}</h4>
                  <div className="rounded-md bg-muted p-3">
                    {field?.field_type_id === 5 ? (
                      <Button
                        variant="outline"
                        onClick={() => {
                          const baseUrl = "http://localhost:8000"; // Replace with your backend base URL
                          const fileUrl = `${baseUrl}/${value as string}`; // Combine base URL with the file path (value)
                          console.log(fileUrl);

                          window.open(fileUrl, "_blank"); // Open the file in a new tab
                        }}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open PDF File
                      </Button>
                    ) : typeof value === 'boolean' ? (
                      value ? "Yes" : "No"
                    ) : (
                      <p className="whitespace-pre-wrap break-words">{String(value)}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>



      </DialogContent>
    </Dialog>
  );
}