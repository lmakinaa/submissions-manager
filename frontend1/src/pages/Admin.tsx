
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, Check, Trash, Plus, FileText, Link as LinkIcon, LogOut, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormBuilder } from "@/components/FormBuilder";
import { api, FormResponse, ApplicationResponse, FormCreate } from "@/services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { handleApiError } from "@/services/api";
import { ApplicationDetailsDialog } from "@/components/ApplicationDetailsDialog";

const Admin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [forms, setForms] = useState<FormResponse[]>([]);
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationResponse | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Load forms
  useEffect(() => {
    const loadForms = async () => {
      try {
        setIsLoading(true);
        const formsData = await api.forms.list();
        setForms(formsData);
        
        // If no form is selected and we have forms, select the first one
        if (selectedFormId === "all" && formsData.length > 0) {
          setSelectedFormId(formsData[0].id.toString());
        }
      } catch (error) {
        handleApiError(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      loadForms();
    }
  }, [isAuthenticated, selectedFormId]);

  // Load applications when a form is selected
  useEffect(() => {
    const loadApplications = async () => {
      try {
        if (selectedFormId !== "all") {
          const formId = parseInt(selectedFormId);
          const applicationsData = await api.applications.listByForm(formId);
          setApplications(applicationsData);
        } else if (forms.length > 0) {
          // If "All Forms" is selected, fetch applications for all forms
          const allApplications: ApplicationResponse[] = [];
          
          for (const form of forms) {
            const formApplications = await api.applications.listByForm(form.id);
            allApplications.push(...formApplications);
          }
          
          setApplications(allApplications);
        }
      } catch (error) {
        handleApiError(error);
      }
    };

    if (isAuthenticated && (selectedFormId !== "all" || forms.length > 0)) {
      loadApplications();
    }
  }, [isAuthenticated, selectedFormId, forms]);

  const handleCreateForm = async (formData: FormCreate) => {
    try {
      setIsLoading(true);
      const newForm = await api.forms.create(formData);
      setForms([...forms, newForm]);
      
      // Select the newly created form
      setSelectedFormId(newForm.id.toString());
      
      // Generate form link
      const formLink = `${window.location.origin}/apply/${newForm.id}`;
      
      toast({
        title: "Form Created",
        description: "Your application form has been created successfully.",
      });
      
      toast({
        title: "Form Link Generated",
        description: (
          <span>
            Share this link with applicants:{" "}
            <button
              onClick={() => {
                navigator.clipboard.writeText(formLink);
                toast({
                  title: "Link Copied",
                  description: "The form link has been copied to your clipboard.",
                });
              }}
              className="text-blue-500 underline"
            >
              {formLink}
            </button>
          </span>
        ),
      });
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = (formId: number) => {
    const link = `${window.location.origin}/apply/${formId}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied",
      description: "Application form link copied to clipboard",
    });
  };

  const handleViewApplication = (application: ApplicationResponse) => {
    setSelectedApplication(application);
    setIsDialogOpen(true);
  };

  const handleMarkApplication = async (applicationId: number) => {
    // This would typically update the application status in the API
    // For now, we'll just show a toast notification
    toast({
      title: "Application Marked",
      description: `Application ${applicationId} has been marked as reviewed`,
    });
  };

  const handleRemoveApplication = async (applicationId: number) => {
    // This would typically delete the application via the API
    await api.applications.delete(applicationId);
    toast({
      title: "Application Removed",
      description: `Application ${applicationId} has been removed`,
    });
    
    // Update the local state to remove the application
    setApplications(applications.filter(app => app.id !== applicationId));
  };

  // Get form fields for the currently selected form
  const getFormFieldsForApplication = () => {
    if (selectedApplication && selectedFormId !== "all") {
      const selectedForm = forms.find(form => form.id === parseInt(selectedFormId));
      return selectedForm?.field_config || [];
    }
    return [];
  };

  const filteredApplications = selectedFormId === "all"
    ? applications
    : applications.filter(app => app.form_id === parseInt(selectedFormId));

  if (!isAuthenticated) {
    return null; // Don't render anything if not authenticated
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-8 mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="mt-2 text-muted-foreground">
              Create and manage your application forms
            </p>
          </div>
          <Button variant="outline" onClick={() => logout()}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="submissions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="submissions">
              <FileText className="w-4 h-4 mr-2" />
              Submissions
            </TabsTrigger>
            <TabsTrigger value="create">
              <Plus className="w-4 h-4 mr-2" />
              Create Form
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>Create Application Form</CardTitle>
                <CardDescription>
                  Design a new application form with drag and drop fields
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormBuilder onSave={handleCreateForm} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submissions">
            <Card>
              <CardHeader>
                <CardTitle>Application Submissions</CardTitle>
                <CardDescription>
                  Review and manage submitted applications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label htmlFor="formSelect">Select Form</Label>
                    <Select
                      value={selectedFormId}
                      onValueChange={setSelectedFormId}
                      disabled={isLoading || forms.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={isLoading ? "Loading forms..." : "Select a form"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Forms</SelectItem>
                        {forms.map((form) => (
                          <SelectItem key={form.id} value={form.id.toString()}>
                            {form.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedFormId !== "all" && (
                    <Button
                      variant="outline"
                      className="mt-6"
                      onClick={() => handleCopyLink(parseInt(selectedFormId))}
                    >
                      <LinkIcon className="w-4 h-4 mr-2" />
                      Copy Form Link
                    </Button>
                  )}
                </div>

                {isLoading ? (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">Loading applications...</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Form Data</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredApplications.length > 0 ? (
                          filteredApplications.map((application) => {
                            const formDataObj = typeof application.form_data === "string" ? 
                              JSON.parse(application.form_data) : application.form_data;
                            const fullName = formDataObj.fullName || formDataObj.name || "Applicant";
                            const email = formDataObj.email || formDataObj.applicant_email || "";
                            
                            return (
                              <TableRow key={application.id}>
                                <TableCell>
                                  <div className="space-y-1">
                                    <div className="font-medium">{fullName}</div>
                                    {email && <div className="text-sm text-muted-foreground">{email}</div>}
                                  </div>
                                </TableCell>
                                <TableCell>{new Date(application.created_at).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => handleViewApplication(application)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    {/*                        
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => handleMarkApplication(application.id)}
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                     */}
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="text-destructive hover:bg-destructive/90 hover:text-destructive-foreground"
                                      onClick={() => handleRemoveApplication(application.id)}
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-6">
                              <p className="text-muted-foreground">No applications found</p>
                              {selectedFormId !== "all" && (
                                <div className="mt-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCopyLink(parseInt(selectedFormId))}
                                  >
                                    <LinkIcon className="w-4 h-4 mr-2" />
                                    Copy Form Link to Share
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <ApplicationDetailsDialog 
        application={selectedApplication}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        formFields={getFormFieldsForApplication()}
      />
    </div>
  );
};

export default Admin;
