import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AI_MODELS, DocumentType, DOCUMENT_TYPES } from "@shared/schema";
import { Icon } from "@/components/ui/icons";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";

interface Document {
  id: number;
  name: string;
  description: string | null;
  fileType: string;
  fileSize: number;
  createdAt: string;
  lastUsed: string | null;
}

interface AssistantConfig {
  id: number;
  name: string;
  instructions: string | null;
  model: string;
  temperature: string;
  maxTokens: number;
  activeDocuments: number[];
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export default function AssistantConfigPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("config");
  const [testQuery, setTestQuery] = useState("");
  const [testResponse, setTestResponse] = useState("");
  const [testLoading, setTestLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  // Consulta para obtener la configuración del asistente
  const { 
    data: config,
    isLoading: configLoading,
    error: configError
  } = useQuery({
    queryKey: ["/api/assistant/config"],
    retry: 1
  });
  
  // Consulta para obtener documentos
  const {
    data: documents,
    isLoading: documentsLoading,
    error: documentsError
  } = useQuery({
    queryKey: ["/api/documents"],
    retry: 1
  });
  
  // Mutación para actualizar la configuración
  const updateConfigMutation = useMutation({
    mutationFn: async (newConfig: Partial<AssistantConfig>) => {
      return await apiRequest("POST", "/api/assistant/config", newConfig);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assistant/config"] });
      toast({
        title: "Configuración actualizada",
        description: "La configuración del asistente ha sido actualizada correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo actualizar la configuración: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Mutación para eliminar documentos
  const deleteDocumentMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      // También invalidar la configuración por si tenía este documento como activo
      queryClient.invalidateQueries({ queryKey: ["/api/assistant/config"] });
      toast({
        title: "Documento eliminado",
        description: "El documento ha sido eliminado correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo eliminar el documento: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Configurar dropzone para subir archivos
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;
      
      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', file.name);
      
      setIsUploading(true);
      setUploadProgress(0);
      
      try {
        // Simular progreso de carga
        const interval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 95) {
              clearInterval(interval);
              return 95;
            }
            return prev + 5;
          });
        }, 200);
        
        await apiRequest("POST", "/api/documents", formData, {
          headers: {
            // No establecer Content-Type, para que el navegador lo haga con el límite correcto para FormData
          }
        });
        
        clearInterval(interval);
        setUploadProgress(100);
        
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
          
          // Recargar lista de documentos
          queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
          
          toast({
            title: "Documento subido",
            description: "El documento ha sido subido correctamente.",
          });
        }, 500);
      } catch (error) {
        setIsUploading(false);
        setUploadProgress(0);
        
        toast({
          title: "Error al subir documento",
          description: error instanceof Error ? error.message : "Error desconocido",
          variant: "destructive",
        });
      }
    }
  });
  
  // Manejar la prueba del asistente
  const handleTestAssistant = async () => {
    if (!testQuery.trim()) {
      toast({
        title: "Consulta vacía",
        description: "Por favor, ingresa una consulta para probar el asistente.",
        variant: "destructive",
      });
      return;
    }
    
    setTestLoading(true);
    setTestResponse("");
    
    try {
      const response = await apiRequest("POST", "/api/assistant/test", { query: testQuery });
      const data = await response.json();
      
      setTestResponse(data.response);
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudo realizar la prueba: ${error instanceof Error ? error.message : "Error desconocido"}`,
        variant: "destructive",
      });
    } finally {
      setTestLoading(false);
    }
  };
  
  // Manejar cambios en la configuración
  const handleConfigChange = (field: string, value: any) => {
    if (!config) return;
    
    const newConfig = { ...config, [field]: value };
    updateConfigMutation.mutate(newConfig);
  };
  
  // Manejar toggle de documentos activos
  const toggleActiveDocument = (docId: number) => {
    if (!config) return;
    
    const activeDocuments = [...(config.activeDocuments || [])];
    const index = activeDocuments.indexOf(docId);
    
    if (index >= 0) {
      activeDocuments.splice(index, 1);
    } else {
      activeDocuments.push(docId);
    }
    
    updateConfigMutation.mutate({ ...config, activeDocuments });
  };
  
  // Formatear tamaño de archivo
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };
  
  // Renderizar icono según tipo de archivo
  const renderFileIcon = (fileType: string) => {
    switch (fileType) {
      case DOCUMENT_TYPES.PDF:
        return <Icon name="picture_as_pdf" className="text-destructive/80" />;
      case DOCUMENT_TYPES.DOCX:
        return <Icon name="article" className="text-blue-500/80" />;
      case DOCUMENT_TYPES.TXT:
        return <Icon name="text_snippet" className="text-gray-500/80" />;
      default:
        return <Icon name="description" className="text-muted-foreground" />;
    }
  };
  
  // Renderizar fecha formateada
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "Nunca";
    
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (configLoading || documentsLoading) {
    return (
      <div className="container max-w-7xl mx-auto p-4">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Cargando configuración...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-7xl mx-auto p-4">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Configuración del Asistente</h1>
          <p className="text-muted-foreground">
            Configura tu asistente de voz y gestiona los documentos de contexto para respuestas personalizadas.
          </p>
        </div>
        
        <Tabs defaultValue="config" value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="config">Configuración</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
            <TabsTrigger value="test">Probar Asistente</TabsTrigger>
          </TabsList>
          
          {/* Pestaña de Configuración */}
          <TabsContent value="config">
            <Card>
              <CardHeader>
                <CardTitle>Ajustes del Asistente</CardTitle>
                <CardDescription>
                  Personaliza el comportamiento de tu asistente de voz para adaptarlo a tus necesidades.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {config && (
                  <>
                    <div className="space-y-3">
                      <Label htmlFor="name">Nombre del asistente</Label>
                      <Input 
                        id="name"
                        value={config.name} 
                        onChange={(e) => handleConfigChange("name", e.target.value)} 
                        className="max-w-md"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="instructions">Instrucciones</Label>
                      <Textarea 
                        id="instructions"
                        value={config.instructions || ''} 
                        onChange={(e) => handleConfigChange("instructions", e.target.value)} 
                        className="min-h-32"
                        placeholder="Instrucciones para el asistente, como su personalidad, tono, o información específica que debe considerar al responder."
                      />
                      <p className="text-sm text-muted-foreground">
                        Define la personalidad y comportamiento de tu asistente. Estas instrucciones guiarán sus respuestas.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="model">Modelo de IA</Label>
                        <Select 
                          value={config.model} 
                          onValueChange={(value) => handleConfigChange("model", value)}
                        >
                          <SelectTrigger id="model">
                            <SelectValue placeholder="Seleccionar modelo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={AI_MODELS.GPT_3_5}>GPT-3.5 Turbo</SelectItem>
                            <SelectItem value={AI_MODELS.GPT_4}>GPT-4</SelectItem>
                            <SelectItem value={AI_MODELS.GPT_4O}>GPT-4o (Última versión)</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground">
                          Modelos más avanzados pueden ofrecer mejores respuestas pero pueden ser más lentos.
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <Label htmlFor="temperature">Temperatura: {parseFloat(config.temperature).toFixed(1)}</Label>
                        </div>
                        <Slider
                          id="temperature"
                          min={0}
                          max={1}
                          step={0.1}
                          defaultValue={[parseFloat(config.temperature)]}
                          onValueChange={([value]) => handleConfigChange("temperature", value.toString())}
                        />
                        <p className="text-sm text-muted-foreground">
                          Valores más bajos generan respuestas más predecibles, valores más altos generan respuestas más creativas.
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="maxTokens">Longitud máxima de respuesta: {config.maxTokens}</Label>
                      <Slider
                        id="maxTokens"
                        min={100}
                        max={2000}
                        step={100}
                        defaultValue={[config.maxTokens]}
                        onValueChange={([value]) => handleConfigChange("maxTokens", value)}
                      />
                      <p className="text-sm text-muted-foreground">
                        Controla la longitud máxima de las respuestas del asistente. Valores más altos permiten respuestas más detalladas.
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            
            {/* Documentos activos */}
            {documents && documents.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Documentos Activos</CardTitle>
                  <CardDescription>
                    Selecciona los documentos que el asistente debe utilizar como contexto al responder.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {documents.map((doc: Document) => (
                      <div
                        key={doc.id}
                        className={cn(
                          "border rounded-lg p-4 cursor-pointer transition-all hover:border-primary",
                          config?.activeDocuments?.includes(doc.id)
                            ? "bg-primary/10 border-primary"
                            : "bg-card"
                        )}
                        onClick={() => toggleActiveDocument(doc.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-muted">
                            {renderFileIcon(doc.fileType)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium truncate">{doc.name}</p>
                              {config?.activeDocuments?.includes(doc.id) && (
                                <Badge variant="outline" className="ml-2 bg-primary/20">Activo</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatFileSize(doc.fileSize)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Pestaña de Documentos */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Documentos de Contexto</CardTitle>
                <CardDescription>
                  Carga documentos para que el asistente pueda utilizarlos como referencia al responder preguntas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Zona de carga de archivos */}
                <div
                  {...getRootProps()}
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all",
                    isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/20"
                  )}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Icon name="upload_file" className="text-4xl text-muted-foreground/70" />
                    <div>
                      <p className="font-medium">Arrastra un archivo o haz clic para seleccionarlo</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Soporta archivos PDF, DOCX y TXT (Máximo 100MB)
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Progreso de carga */}
                {isUploading && (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subiendo documento...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-primary h-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {/* Lista de documentos */}
                {documents && documents.length > 0 ? (
                  <div className="mt-8 space-y-4">
                    <h3 className="text-lg font-medium">Documentos cargados</h3>
                    <div className="divide-y">
                      {documents.map((doc: Document) => (
                        <div key={doc.id} className="py-4 first:pt-0">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-muted">
                                {renderFileIcon(doc.fileType)}
                              </div>
                              <div>
                                <p className="font-medium">{doc.name}</p>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-xs text-muted-foreground">
                                    {formatFileSize(doc.fileSize)}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    Subido: {formatDate(doc.createdAt)}
                                  </span>
                                  {doc.lastUsed && (
                                    <span className="text-xs text-muted-foreground">
                                      Último uso: {formatDate(doc.lastUsed)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                if (confirm('¿Estás seguro de eliminar este documento?')) {
                                  deleteDocumentMutation.mutate(doc.id);
                                }
                              }}
                            >
                              <Icon name="delete" className="text-destructive/80" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-8 text-center p-8 border rounded-lg bg-muted/10">
                    <Icon name="folder_off" className="text-3xl text-muted-foreground/50 mb-2" />
                    <p className="text-muted-foreground">No hay documentos cargados</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Carga documentos para que el asistente pueda utilizarlos como referencia.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Pestaña de Prueba */}
          <TabsContent value="test">
            <Card>
              <CardHeader>
                <CardTitle>Probar el Asistente</CardTitle>
                <CardDescription>
                  Prueba cómo responderá el asistente utilizando la configuración y documentos de contexto actuales.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label htmlFor="testQuery">Tu consulta</Label>
                  <Textarea 
                    id="testQuery"
                    value={testQuery} 
                    onChange={(e) => setTestQuery(e.target.value)} 
                    placeholder="Escribe una pregunta o consulta para el asistente"
                    className="min-h-16"
                  />
                </div>
                
                <Button 
                  onClick={handleTestAssistant} 
                  disabled={testLoading || !testQuery.trim()}
                  className="w-full"
                >
                  {testLoading ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-background rounded-full border-t-transparent"></div>
                      Generando respuesta...
                    </>
                  ) : (
                    "Probar Asistente"
                  )}
                </Button>
                
                {testResponse && (
                  <div className="mt-4 pt-4 border-t">
                    <Label>Respuesta del asistente:</Label>
                    <div className="mt-2 p-4 rounded-lg bg-muted/30 border whitespace-pre-wrap">
                      {testResponse}
                    </div>
                  </div>
                )}
                
                <div className="mt-4 p-4 rounded-lg bg-muted/10 border border-muted">
                  <div className="flex items-start gap-3">
                    <Icon name="info" className="text-blue-500/80 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm">
                        Esta prueba utiliza la configuración actual del asistente y los documentos marcados como activos.
                        Las respuestas pueden variar dependiendo de la temperatura configurada.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}