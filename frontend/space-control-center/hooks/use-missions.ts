"use client";

import { useState, useEffect, useCallback } from "react";
import { missionAPI, type MissaoDTO, type CriarMissaoRequest } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast"; // Ajuste o caminho se necessário

export function useMissions() {
  const [missions, setMissions] = useState<MissaoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchMissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await missionAPI.listarMissoes();
      setMissions(data);
    } catch (err) {
      const errorMessage = "Erro ao carregar missões.";
      setError(errorMessage);
      toast({ title: "Erro", description: errorMessage, variant: "destructive" });
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createMission = async (missionData: CriarMissaoRequest): Promise<MissaoDTO | null> => {
    try {
      const newMission = await missionAPI.criarMissao(missionData);
      // setMissions((prev) => [...prev, newMission]); // Atualiza via fetchMissions para garantir consistência
      await fetchMissions(); // Recarrega a lista
      toast({
        title: "Sucesso!",
        description: `Missão "${newMission.nome}" criada.`,
      });
      return newMission;
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao criar missão.", variant: "destructive" });
      console.error(err);
      return null;
    }
  };

   const deleteMission = async (id: number): Promise<boolean> => {
     try {
       await missionAPI.deletarMissao(id);
       await fetchMissions(); // Recarrega a lista
       toast({ title: "Sucesso!", description: "Missão excluída." });
       return true;
     } catch (err) {
       toast({ title: "Erro", description: "Falha ao excluir missão.", variant: "destructive" });
       console.error(err);
       return false;
     }
   };

   const startSimulation = async (id: number): Promise<boolean> => {
     try {
       const updatedMission = await missionAPI.iniciarSimulacao(id);
       await fetchMissions(); // Recarrega a lista
       toast({ title: "Sucesso!", description: `Missão "${updatedMission.nome}" iniciada.` });
       return true;
     } catch (err) {
       toast({ title: "Erro", description: "Falha ao iniciar simulação.", variant: "destructive" });
       console.error(err);
       return false;
     }
   };

  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  return {
    missions,
    loading,
    error,
    fetchMissions,
    createMission,
    deleteMission,
    startSimulation,
  };
}