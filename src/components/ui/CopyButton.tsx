import { useEffect, useRef, useState } from 'react'
import { Icon } from './Icon'

export function CopyEmailButton({
  email,
  className = 'button button-secondary',
}: {
  email: string
  className?: string
}) {
  const [status, setStatus] = useState<'idle' | 'copying' | 'copied' | 'error'>(
    'idle',
  )
  const timer = useRef<ReturnType<typeof setTimeout>>()
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      clearTimeout(timer.current)
    }
  }, [])

  async function copy() {
    clearTimeout(timer.current)
    setStatus('copying')
    try {
      await navigator.clipboard.writeText(email)
      if (mounted.current) {
        setStatus('copied')
        timer.current = setTimeout(() => setStatus('idle'), 2600)
      }
    } catch {
      if (mounted.current) setStatus('error')
    }
  }

  return (
    <div className="copy-control">
      <button
        type="button"
        className={className}
        disabled={status === 'copying'}
        onClick={copy}
      >
        <Icon
          name={status === 'copied' ? 'check' : 'copy'}
          width="17"
          height="17"
        />
        {status === 'copied'
          ? 'Email copied'
          : status === 'copying'
            ? 'Copying…'
            : 'Copy email'}
      </button>
      <span
        className={status === 'error' ? 'copy-message' : 'sr-only'}
        role="status"
      >
        {status === 'error'
          ? 'Couldn’t copy. Select the address above, or use the email link.'
          : status === 'copied'
            ? 'Email address copied to clipboard.'
            : ''}
      </span>
    </div>
  )
}
