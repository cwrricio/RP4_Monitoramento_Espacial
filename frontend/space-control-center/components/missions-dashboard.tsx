// space-control-center/components/missions-dashboard.tsx
"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react"; // Importar Loader2 para indicar loading
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MissionCard } from "@/components/mission-card";
import { NewMissionSheet } from "@/components/new-mission-sheet";
import { useMissions } from "@/hooks/use-missions"; // Importar o hook
import { MissaoDTO } from "@/lib/api"; // Importar DTO


export function MissionsDashboard() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const { missions, loading, error, createMission, deleteMission, startSimulation } = useMissions();

  const filterMissions = (status?: MissaoDTO['status']) => {
    if (!status) return missions;
    return missions.filter((m) => m.status === status);
  };

  const handleMissionCreated = async (missionData: any) => {
    const success = await createMission(missionData);
    if (success) {
      setIsSheetOpen(false); 
    }

  };

  const handleDelete = async (id: number) => {
    await deleteMission(id);

  };

  const handleStart = async (id: number) => {
     await startSimulation(id);
 
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard de Missões</h1>
        <Button onClick={() => setIsSheetOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Missão
        </Button>
      </div>

      {/* Exibir erro ou loading */}
      {error && <div className="text-destructive p-4 border border-destructive rounded">{error}</div>}
      {loading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Carregando missões...</span>
        </div>
      )}

      {/* Tabs e Conteúdo (só mostra se não estiver carregando e sem erro inicial) */}
      {!loading && !error && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral ({missions.length})</TabsTrigger>
            <TabsTrigger value="planned">Planejadas ({filterMissions("PLANEJADA").length})</TabsTrigger>
            <TabsTrigger value="ongoing">Em Andamento ({filterMissions("EM_ANDAMENTO").length})</TabsTrigger>
            <TabsTrigger value="completed">Concluídas ({filterMissions("CONCLUIDA").length})</TabsTrigger>
            <TabsTrigger value="failed">Falharam ({filterMissions("FALHOU").length})</TabsTrigger>
          </TabsList>

          {/* Renderiza o conteúdo das abas */}
          {(["overview", "planned", "ongoing", "completed", "failed"] as const).map((tabValue) => (
             <TabsContent key={tabValue} value={tabValue} className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {filterMissions(tabValue === "overview" ? undefined : tabValue.toUpperCase() as MissaoDTO['status']).map((mission) => (
                   <MissionCard
                     key={mission.id}
                     mission={mission}
                     onDelete={() => handleDelete(mission.id)} // Passa a função de deletar
                     onStart={() => handleStart(mission.id)}   // Passa a função de iniciar
                     
                   />
                 ))}
               </div>
               {filterMissions(tabValue === "overview" ? undefined : tabValue.toUpperCase() as MissaoDTO['status']).length === 0 && (
                 <p className="text-muted-foreground text-center py-4">Nenhuma missão encontrada nesta categoria.</p>
               )}
             </TabsContent>
          ))}
        </Tabs>
      )}

      {/* O Sheet agora recebe a função createMission */}
      <NewMissionSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onCreateMission={handleMissionCreated} // Passa a função correta
      />
    </div>
  );
}