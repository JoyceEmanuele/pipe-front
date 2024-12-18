import { BorderSpan, NameCardItem } from '../WaterCard/style';

type TTabOptionCard = {
  selected: string
  loading?: boolean
  arrayItems: {
    label: string
    name: string
    onClickFunc: () => void,
  }[]
}

export function TabOptionCard({ selected, arrayItems, loading }: Readonly<TTabOptionCard>) {
  const isDesktop = window.matchMedia('(min-width: 1039px)');
  return (
    <>
      <div
        style={{
          display: 'grid',
          position: 'relative',
          gridTemplateColumns: isDesktop.matches ? '15% 15% 15% auto' : '20% 20% 20% auto',
          gap: '3px',
        }}
      >
        {
          arrayItems.map((item, index) => (
            <>
              <NameCardItem
                style={{
                  borderLeft: index === 0 ? 'none' : '',
                  borderBottom: selected === item.label
                    ? 'none' : '1px solid lightgrey',
                  backgroundColor: selected === item.label
                    ? '#fff' : '#f4f4f4',
                  cursor: selected === item.label || loading ? 'not-allowed' : 'pointer',
                  zIndex: selected === item.label ? 1 : 0,
                  opacity: loading ? 0.5 : 1,
                }}
                onClick={() => !loading && item.onClickFunc()}
              >
                {item.name}
              </NameCardItem>
            </>
          ))
        }
        <BorderSpan />
      </div>
    </>
  );
}
