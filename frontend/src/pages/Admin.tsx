
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, Check, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";


interface Application {
  id: number;
  full_name: string;
  email: string;
  status: boolean;
}


const Admin = () => {
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch("http://localhost:8000/admin/applications/");
        if (!response.ok) {
          throw new Error("Failed to fetch applications");
        }
        const data = await response.json();
        console.log(data);
        
        setApplications(data);

      } catch (error) {
        console.error("Error fetching applications:", error);
        toast({
          title: "Error",
          description: "Failed to fetch applications.",
          variant: "destructive",
        });
      }
    };

    fetchApplications();
  }, [toast]);


 const handleDownloadCV = async (full_name: String, id: number) => {
    try {
      const response = await fetch(`http://localhost:8000/admin/applications/${id}/cv/`);
      if (!response.ok) {
        throw new Error("Failed to download CV");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${full_name}-${id}-cv.pdf`); // or use the actual filename
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Error downloading CV:", error);
      toast({
        title: "Error",
        description: "Failed to download CV.",
        variant: "destructive",
      });
    }
  };

  const handleMarkAsReviewed = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8000/admin/applications/${id}/mark/`, {
        method: "PUT",
      });
      if (!response.ok) {
        throw new Error("Failed to mark application as reviewed");
      }
      toast({
        title: "Success",
        description: "Application marked as reviewed.",
      });
      setApplications(applications.map(app => app.id === id ? { ...app, status: true } : app));
    } catch (error) {
      console.error("Error marking application as reviewed:", error);
      toast({
        title: "Error",
        description: "Failed to mark application as reviewed.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteApplication = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8000/admin/applications/${id}/`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete application");
      }
      toast({
        title: "Success",
        description: "Application deleted.",
      });
      setApplications(applications.filter(app => app.id !== id));
    } catch (error) {
      console.error("Error deleting application:", error);
      toast({
        title: "Error",
        description: "Failed to delete application.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-16 mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Applications Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Manage and review all submitted applications
          </p>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                {/* <TableHead>Submitted</TableHead> */}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application: Application) => (
                <TableRow key={application.id}>
                  <TableCell className="font-medium">{application.full_name}</TableCell>
                  <TableCell>{application.email}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        application.status === true
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {application.status ? "Reviewed" : "Pending"}
                    </span>
                  </TableCell>
                  {/* <TableCell>{application.submittedAt}</TableCell> */}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDownloadCV(application.full_name, application.id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleMarkAsReviewed(application.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-destructive hover:bg-destructive/90 hover:text-destructive-foreground"
                        onClick={() => handleDeleteApplication(application.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Admin;