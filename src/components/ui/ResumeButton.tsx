import { profile } from '@/data/profile'
import { Icon } from './Icon'

export function ResumeButton({ id }: { id: string }) {
  const resume = profile.resume
  return resume ? (
    <a className="button button-secondary" href={resume.href} download={resume.filename}>
      Download resume <Icon name="download" width="18" height="18" />
    </a>
  ) : (
    <div className="resume-control" data-resume-unavailable>
      <button className="button button-secondary" type="button" disabled aria-describedby={id + '-note'}>
        Download resume <Icon name="download" width="18" height="18" />
      </button>
      <p className="resume-note" id={id + '-note'}>Resume PDF is not available yet.</p>
    </div>
  )
}
