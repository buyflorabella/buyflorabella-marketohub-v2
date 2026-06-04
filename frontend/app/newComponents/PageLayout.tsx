import { Header } from './Header';
import { Footer } from './Footer';

export const loader = () => {

}

export const PageLayout = ({children}: any) => {
    return <div className="min-h-screen bg-[#0a0015]">
        <Header />
        <main>{children}</main>
        <Footer />
    </div>
}