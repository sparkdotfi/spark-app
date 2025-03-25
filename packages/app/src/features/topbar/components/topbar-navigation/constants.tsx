import { assets } from '@/ui/assets'

export const LINKS_DATA = {
  savings: {
    label: 'Savings',
    icon: <img src={assets.page.savings} alt="Savings icon" className="h-4 w-4" />,
  },
  farms: {
    label: 'Farms',
    icon: <img src={assets.page.farms} alt="Farms icon" className="w-[15px]" />,
  },
  borrow: {
    label: 'Borrow',
    icon: <img src={assets.page.borrow} alt="Borrow icon" className="h-5 w-5" />,
  },
  sparkToken: {
    label: 'SPK Token',
    icon: <img src={assets.token.spk} alt="Spark token icon" className="h-5 w-5" />,
  },
}
