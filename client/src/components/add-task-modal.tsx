import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTaskSchema, TASK_CATEGORIES, TASK_FREQUENCIES } from "@shared/schema";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Icon } from "@/components/ui/icons";
import { getCategoryColor } from "@/lib/utils";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";

// Extended schema for form validation
const formSchema = insertTaskSchema.extend({
  title: z.string().min(1, "El título es obligatorio"),
  time: z.string().min(1, "La hora es obligatoria"),
  date: z.string().min(1, "La fecha es obligatoria"),
});

type FormValues = z.infer<typeof formSchema>;

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>(TASK_CATEGORIES.MEDICINE);
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    parsedTask
  } = useSpeechRecognition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      time: "",
      date: format(new Date(), "yyyy-MM-dd"),
      frequency: TASK_FREQUENCIES.ONCE,
      category: TASK_CATEGORIES.MEDICINE,
      userId: 1, // Default user ID
      completed: false,
    },
  });

  const createTask = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest("POST", "/api/tasks", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Recordatorio creado",
        description: "Tu recordatorio ha sido creado exitosamente.",
      });
      onClose();
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo crear el recordatorio: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    createTask.mutate(data);
  };

  const handleCategorySelect = (category: string) => {
    form.setValue("category", category);
    setSelectedCategory(category);
  };

  const handleVoiceCommand = () => {
    if (isListening) {
      stopListening();
      if (parsedTask) {
        if (parsedTask.title) form.setValue("title", parsedTask.title);
        if (parsedTask.time) form.setValue("time", parsedTask.time);
        if (parsedTask.date) form.setValue("date", parsedTask.date);
        if (parsedTask.category) {
          form.setValue("category", parsedTask.category);
          setSelectedCategory(parsedTask.category);
        }
        if (parsedTask.frequency) form.setValue("frequency", parsedTask.frequency);
      }
    } else {
      resetTranscript();
      startListening();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white rounded-xl p-6 w-full max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Nuevo recordatorio</DialogTitle>
          <DialogClose className="absolute right-4 top-4">
            <Icon name="close" />
          </DialogClose>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">¿Qué necesitas recordar?</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ej: Tomar medicina"
                      className="w-full p-4 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">Hora</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="time"
                        className="w-full p-4 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">Fecha</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="date"
                        className="w-full p-4 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Repetir</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full p-4 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary">
                        <SelectValue placeholder="Selecciona la frecuencia" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={TASK_FREQUENCIES.ONCE}>Una vez</SelectItem>
                      <SelectItem value={TASK_FREQUENCIES.DAILY}>Diariamente</SelectItem>
                      <SelectItem value={TASK_FREQUENCIES.WEEKLY}>Semanalmente</SelectItem>
                      <SelectItem value={TASK_FREQUENCIES.MONTHLY}>Mensualmente</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Categoría</FormLabel>
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      type="button"
                      className={`p-3 rounded-lg flex flex-col items-center border-2 ${
                        selectedCategory === TASK_CATEGORIES.MEDICINE
                          ? "border-primary " + getCategoryColor(TASK_CATEGORIES.MEDICINE)
                          : "border-transparent " + getCategoryColor(TASK_CATEGORIES.MEDICINE)
                      }`}
                      onClick={() => handleCategorySelect(TASK_CATEGORIES.MEDICINE)}
                    >
                      <Icon name="medication" className="mb-1" />
                      <span className="text-sm">Medicina</span>
                    </Button>
                    <Button
                      type="button"
                      className={`p-3 rounded-lg flex flex-col items-center border-2 ${
                        selectedCategory === TASK_CATEGORIES.MEAL
                          ? "border-success " + getCategoryColor(TASK_CATEGORIES.MEAL)
                          : "border-transparent " + getCategoryColor(TASK_CATEGORIES.MEAL)
                      }`}
                      onClick={() => handleCategorySelect(TASK_CATEGORIES.MEAL)}
                    >
                      <Icon name="restaurant" className="mb-1" />
                      <span className="text-sm">Comida</span>
                    </Button>
                    <Button
                      type="button"
                      className={`p-3 rounded-lg flex flex-col items-center border-2 ${
                        selectedCategory === TASK_CATEGORIES.GENERAL
                          ? "border-secondary " + getCategoryColor(TASK_CATEGORIES.GENERAL)
                          : "border-transparent " + getCategoryColor(TASK_CATEGORIES.GENERAL)
                      }`}
                      onClick={() => handleCategorySelect(TASK_CATEGORIES.GENERAL)}
                    >
                      <Icon name="event" className="mb-1" />
                      <span className="text-sm">General</span>
                    </Button>
                  </div>
                </FormItem>
              )}
            />

            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                className={`w-full border border-primary text-primary py-4 px-6 rounded-lg text-md font-bold mb-3 flex items-center justify-center ${
                  isListening ? "bg-primary text-white" : ""
                }`}
                onClick={handleVoiceCommand}
              >
                <Icon name="mic" className="mr-2" />
                {isListening ? "Escuchando..." : "Crear por voz"}
              </Button>
              
              {transcript && (
                <div className="mb-4 p-2 bg-gray-50 rounded border">
                  <p className="text-sm">{transcript}</p>
                </div>
              )}
              
              <Button
                type="submit"
                className="w-full bg-primary text-white py-4 px-6 rounded-lg text-md font-bold"
                disabled={createTask.isPending}
              >
                {createTask.isPending ? "Guardando..." : "Guardar recordatorio"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTaskModal;
