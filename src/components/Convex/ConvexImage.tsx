export default function ConvexImage({ message }: { message: { url: string } }) {
    return <img src={message.url} height="300px" width="auto" />;
}