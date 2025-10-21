"use client";

import { useState, useEffect, useCallback } from "react";
import { astronautAPI, type AstronautaDTO, type AtualizaAstronautaRequest } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast"; // Ajuste o caminho se necessário

export function useAstronauts() {
  const [astronauts, setAstronauts] = useState<AstronautaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAstronauts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await astronautAPI.listarAstronautas();
      setAstronauts(data);
    } catch (err) {
      const errorMessage = "Erro ao carregar astronautas.";
      setError(errorMessage);
      toast({ title: "Erro", description: errorMessage, variant: "destructive" });
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [toast]);

 const createAstronaut = async (astronautData: AtualizaAstronautaRequest): Promise<AstronautaDTO | null> => {
    try {
      const payload: AtualizaAstronautaRequest = {
        nome: astronautData.nome,
        idade: Number(astronautData.idade) || 0, 
        ativo: astronautData.ativo !== undefined ? astronautData.ativo : true, 
        nivelAptidaoMedica: astronautData.nivelAptidaoMedica,
        missoesRealizadas: astronautData.missoesRealizadas !== undefined ? Number(astronautData.missoesRealizadas) : 0, 
        tipoBiometria: astronautData.tipoBiometria,
        valorBiometria: astronautData.valorBiometria,
        unidadeBiometria: astronautData.unidadeBiometria,
      };

      const newAstronaut = await astronautAPI.criarAstronauta(payload);
      await fetchAstronauts(); // Recarrega a lista
      toast({
        title: "Sucesso!",
        description: `Astronauta "${newAstronaut.nome}" adicionado.`,
      });
      return newAstronaut;
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao adicionar astronauta.", variant: "destructive" });
      console.error(err);
      return null;
    }
  };

const updateAstronaut = async (id: number, astronautData: Partial<AtualizaAstronautaRequest>): Promise<AstronautaDTO | null> => {
     try {
       const currentData = astronauts.find(a => a.id === id);
       if (!currentData) throw new Error("Astronauta não encontrado localmente para atualização.");

       const payload: AtualizaAstronautaRequest = {
         nome: currentData.nome,
         ativo: currentData.ativo,
         nivelAptidaoMedica: currentData.nivelAptidaoMedica,
         tipoBiometria: currentData.tipoBiometria ?? undefined,
         valorBiometria: currentData.valorBiometria ?? undefined,
         unidadeBiometria: currentData.unidadeBiometria ?? undefined,
         ...astronautData,
         idade: Number(astronautData.idade ?? currentData.idade) || 0,
         missoesRealizadas: astronautData.missoesRealizadas !== undefined
            ? Number(astronautData.missoesRealizadas)
            : currentData.missoesRealizadas,
       };

       const updatedAstronaut = await astronautAPI.atualizarAstronauta(id, payload);
       await fetchAstronauts(); // Recarrega a lista
       toast({ title: "Sucesso!", description: `Dados de "${updatedAstronaut.nome}" atualizados.` });
       return updatedAstronaut;
     } catch (err) {
       toast({ title: "Erro", description: "Falha ao atualizar astronauta.", variant: "destructive" });
       console.error(err);
       return null;
     }
   };

   const deleteAstronaut = async (id: number): Promise<boolean> => {
     try {
       await astronautAPI.deletarAstronauta(id);
       await fetchAstronauts(); // Recarrega a lista
       toast({ title: "Sucesso!", description: "Astronauta removido." });
       return true;
     } catch (err) {
       toast({ title: "Erro", description: "Falha ao remover astronauta.", variant: "destructive" });
       console.error(err);
       return false;
     }
   };


  useEffect(() => {
    fetchAstronauts();
  }, [fetchAstronauts]);

  return {
    astronauts,
    loading,
    error,
    fetchAstronauts,
    createAstronaut,
    updateAstronaut, // Adicionado
    deleteAstronaut, // Adicionado
  };
}