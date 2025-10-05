import { useState } from "react";
import { X } from "lucide-react";

export const TermsPopup = () => {
    const [isOpen, setIsOpen] = useState(false);

    // Função para fechar o modal, usada tanto no botão X quanto no clique de fundo
    const closeModal = () => setIsOpen(false);

    return (
        <div className="mt-4 text-center">
            {/* Texto clicável */}
            <p
                className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
                onClick={() => setIsOpen(true)}
            >
                Ao clicar em continuar, você declara que leu e concorda com os 
                <strong className="underline font-bold text-gray-700 dark:text-gray-200 ml-1">
                    Termos de Uso e a Política de Privacidade.
                </strong>
            </p>

            {/* Popup centralizado */}
            {isOpen && (
                <div
                    // Overlay Fixo com correções para overflow
                    className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-[9999] p-4 overflow-y-auto overflow-x-hidden" // Adicionado overflow-x-hidden
                    aria-modal="true"
                    role="dialog"
                    onClick={(e) => {
                        // Fecha o modal apenas se o clique for no overlay (fundo)
                        if (e.target === e.currentTarget) {
                            closeModal();
                        }
                    }}
                >
                    <div
                        // Container do Conteúdo: Fundo, Sombra, Largura responsiva, max-h fixo.
                        // Usado 'relative' para posicionar o header 'sticky'
                        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-xl w-full text-start relative transform transition-all duration-300 scale-100 my-auto max-h-[90vh] flex flex-col"
                    >
                        {/* Header Fixo/Sticky (UX Melhorado) */}
                        <div className="sticky top-0 bg-white dark:bg-gray-900 flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700 z-10 rounded-t-xl shadow-sm">
                            <span className="text-xl font-bold text-gray-900 dark:text-white">Termos e Condições - Streampix</span>
                            <button
                                onClick={closeModal}
                                // Botão de fechar
                                className="p-1 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-white transition-colors duration-200"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        {/* Corpo do Conteúdo - Agora rolável */}
                        <div className="p-5 space-y-4 text-gray-700 dark:text-gray-300 overflow-y-auto flex-grow">
                            <p>
                                <strong className="text-gray-900 dark:text-white">O que é a Streampix?</strong>
                                <br />
                                A Streampix atua, principalmente, como plataforma de intermediação de pagamentos entre produtores de conteúdo e seu público.
                            </p>

                            <p>
                                <strong className="text-gray-900 dark:text-white">Como tratamos seus dados?</strong>
                                <br />
                                Para realizar nossas atividades, é necessário coletar e tratar algumas informações classificadas como dados pessoais pela legislação. Abaixo, apresentamos um resumo das principais práticas adotadas e, se desejar mais detalhes, clique em "Leia Mais" nas seções correspondentes.
                            </p>

                            <p>
                                <strong className="text-gray-900 dark:text-white">Para que utilizamos seus dados?</strong>
                                <br />
                                Utilizamos os dados pessoais coletados para finalidades relacionadas à prestação dos nossos serviços, tais como:
                                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                                    <li>Gerenciamento e manutenção de registros;</li>
                                    <li>Permitir o acesso e uso da plataforma;</li>
                                    <li>Validar identidade e garantir segurança;</li>
                                    <li>Estabelecer contato, quando necessário.</li>
                                </ul>
                            </p>

                            <p>
                                <strong className="text-gray-900 dark:text-white">Como protegemos seus dados?</strong>
                                <br />
                                A Streampix adota medidas técnicas e organizacionais adequadas para proteger seus dados pessoais, tais como:
                                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                                    <li>Política interna de proteção de dados aplicável a todos os colaboradores;</li>
                                    <li>Plano de resposta a incidentes de segurança;</li>
                                    <li>Uso de criptografia com certificado SSL;</li>
                                    <li>Treinamento contínuo das equipes sobre boas práticas de privacidade e segurança.</li>
                                </ul>
                            </p>

                            <p>
                                <strong className="text-gray-900 dark:text-white">Por quanto tempo armazenamos os dados?</strong>
                                <br />
                                Somente mantemos os dados necessários para as finalidades do tratamento. Conservamos informações requeridas por obrigações legais, regulatórias ou judiciais.
                            </p>

                            <p className="pt-2 border-t border-gray-200 dark:border-gray-700 font-semibold mt-6">
                                Ao continuar a usar nosso serviço, você declara ter lido, entendido e concordado com estes Termos e Condições da Streampix.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};