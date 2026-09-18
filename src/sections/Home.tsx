import { Hero } from './Hero'
import { WorkGateway } from './WorkGateway'
import { useContentEntrance } from '@/lib/scene'

export function Home({ motionEnabled }: { motionEnabled: boolean }) {
  useContentEntrance(motionEnabled)
  return (
    <>
      <Hero motionEnabled={motionEnabled} />
      <WorkGateway />
    </>
  )
}
