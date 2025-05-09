import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { api, FieldType, FormField, FormCreate } from "@/services/api";
import { handleApiError } from "@/services/api";
import { Plus, Trash, GripVertical, Save } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

interface FormBuilderProps {
  onSave: (formData: FormCreate) => void;
  initialFormData?: FormCreate;
}

export function FormBuilder({ onSave, initialFormData }: FormBuilderProps) {
  const [formTitle, setFormTitle] = useState(initialFormData?.title || "");
  const [formDescription, setFormDescription] = useState(initialFormData?.description || "");
  const [fields, setFields] = useState<FormField[]>(initialFormData?.field_config || []);
  const [fieldTypes, setFieldTypes] = useState<FieldType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadFieldTypes = async () => {
      try {
        const types = await api.fieldTypes.list();
        setFieldTypes(types);
      } catch (error) {
        handleApiError(error);
      }
    };

    loadFieldTypes();
  }, []);

  const addField = () => {
    const newField: FormField = {
      field_id: `field_${Date.now()}`, // Generate unique field_id
      field_type_id: fieldTypes.length > 0 ? fieldTypes[0].id : 1,
      label: "",
      required: false,
    };
    setFields([...fields, newField]);
  };

  const updateField = (index: number, fieldData: Partial<FormField>) => {
    const updatedFields = [...fields];
    updatedFields[index] = { ...updatedFields[index], ...fieldData };
    setFields(updatedFields);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const reorderedFields = Array.from(fields);
    const [movedItem] = reorderedFields.splice(result.source.index, 1);
    reorderedFields.splice(result.destination.index, 0, movedItem);

    setFields(reorderedFields);
  };

  const handleSubmit = () => {
    // Validate form
    if (!formTitle.trim()) {
      toast({
        title: "Validation Error",
        description: "Form title is required",
        variant: "destructive",
      });
      return;
    }

    if (fields.length === 0) {
      toast({
        title: "Validation Error",
        description: "Add at least one field to your form",
        variant: "destructive",
      });
      return;
    }

    // Check if all fields have labels
    const invalidField = fields.find(field => !field.label.trim());
    if (invalidField) {
      toast({
        title: "Validation Error",
        description: "All fields must have a label",
        variant: "destructive",
      });
      return;
    }

    const formData: FormCreate = {
      title: formTitle,
      description: formDescription,
      field_config: fields,
    };

    onSave(formData);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="formTitle">Form Title</Label>
          <Input
            id="formTitle"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder="e.g., Software Developer Application"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="formDescription">Description</Label>
          <Input
            id="formDescription"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            placeholder="Brief description of the position"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Form Fields</h3>
          <Button 
            onClick={addField} 
            variant="outline" 
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Field
          </Button>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="form-fields">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-3"
              >
                {fields.map((field, index) => (
                  <Draggable key={field.field_id} draggableId={field.field_id} index={index}>
                    {(provided) => (
                      <Card
                        className="border"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-4">
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-move flex items-center justify-center p-2"
                            >
                              <GripVertical className="h-5 w-5 text-gray-400" />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                              <div>
                                <Label htmlFor={`field-label-${index}`}>Field Label</Label>
                                <Input
                                  id={`field-label-${index}`}
                                  value={field.label}
                                  onChange={(e) => updateField(index, { label: e.target.value })}
                                  placeholder="Field label"
                                  className="mt-1"
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor={`field-type-${index}`}>Field Type</Label>
                                <select
                                  id={`field-type-${index}`}
                                  value={field.field_type_id}
                                  onChange={(e) => updateField(index, { field_type_id: Number(e.target.value) })}
                                  className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                  {fieldTypes.map((type) => (
                                    <option key={type.id} value={type.id}>
                                      {type.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              
                              <div className="flex items-end space-x-4">
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`field-required-${index}`}
                                    checked={field.required}
                                    onCheckedChange={(checked) => 
                                      updateField(index, { required: checked === true })
                                    }
                                  />
                                  <Label htmlFor={`field-required-${index}`}>Required</Label>
                                </div>
                                
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="text-destructive hover:bg-destructive/90 hover:text-destructive-foreground ml-auto"
                                  onClick={() => removeField(index)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          {/* Add options input for field types that support options */}
                          {fieldTypes.find(t => t.id === field.field_type_id)?.has_options && (
                            <div className="mt-4 pl-10">
                              <Label htmlFor={`field-options-${index}`}>Options (comma separated)</Label>
                              <Input
                                id={`field-options-${index}`}
                                value={field.options?.join(", ") || ""}
                                onChange={(e) => updateField(index, { 
                                  options: e.target.value.split(",").map(opt => opt.trim()).filter(Boolean)
                                })}
                                placeholder="Option 1, Option 2, Option 3"
                                className="mt-1"
                              />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                
                {fields.length === 0 && (
                  <Card className="border border-dashed">
                    <CardContent className="flex flex-col items-center justify-center p-6">
                      <p className="text-muted-foreground mb-2">No fields added yet</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addField}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Your First Field
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="mt-4"
        >
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? "Saving..." : "Save Form"}
        </Button>
      </div>
    </div>
  );
}
