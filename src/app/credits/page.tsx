import Image from 'next/image';

export default function CreditsPage() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      <h1>Credits</h1>
      <p>Made with love by the development team.</p>
      <Image
        src="/17ecf4df-7d66-43fb-a70f-7b924ad0b40e.gif"
        alt="Cat gif"
        width={300}
        height={300}
      />
    </div>
  );
}
