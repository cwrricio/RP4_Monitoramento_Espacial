import { MissionControlPanel } from "@/components/mission-control-panel"

export default function MissionControlPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-6">
      <MissionControlPanel missionId={params.id} />
    </div>
  )
}
