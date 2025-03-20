import { Button } from '@/ui/atoms/button/Button'
import { ErrorLayout } from '@/ui/layouts/ErrorLayout'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { useNavigate } from 'react-router-dom'
import { useAccountEffect } from 'wagmi'

export function NotConnected({ fullScreen }: { fullScreen?: boolean }) {
  const { openConnectModal } = useConnectModal()
  const navigate = useNavigate()
  useAccountEffect({
    onConnect: () => {
      navigate(0)
    },
  })

  return (
    <ErrorLayout fullScreen={fullScreen}>
      <div className="typography-heading-3">This page is available only for connected users</div>
      <Button onClick={openConnectModal}>Connect wallet</Button>
    </ErrorLayout>
  )
}
