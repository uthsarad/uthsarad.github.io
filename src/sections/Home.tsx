import { Hero } from './Hero'
import { WorkGateway } from './WorkGateway'

export function Home({ motionEnabled }: { motionEnabled: boolean }) {
  return (
    <>
      <Hero motionEnabled={motionEnabled} />
      <WorkGateway />
    </>
  )
}
