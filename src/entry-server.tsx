import App from './App'

export function pageTree(pathname: string) {
  return <App initialPath={pathname} />
}
