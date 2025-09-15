import { useState } from "react";
import './terms-style.css';
import { X } from "lucide-react";

export const TermsPopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ marginTop: "15px" }}>
      {/* Texto clicável */}
      <p
        style={{ cursor: "pointer" }}
        className="terms-p"
        onClick={() => setIsOpen(true)}
      >
        Ao clicar em continuar, você declara que leu e concorda com os <strong style={{ textDecoration: "underline" }}>Termos de Uso e a Política de Privacidade.</strong>
      </p>

      {/* Popup centralizado */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backdropFilter: "blur(10px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            overflowY: "auto"
          }}
        >

          <div
            style={{
              borderRadius: "8px",
              maxWidth: "600px",
              width: "100%",
              textAlign: "start",
              position: "relative",
            }}
            className="terms-container"
          >
            <div className="terms-title"><span>Termos e Condições - Streampix</span>  <button onClick={() => setIsOpen(false)} style={{display: "flex",width: "max-content" ,justifyContent: "center", alignItems:"center"}}><X size={20}/></button>
            </div>

            <p><strong>O que é a Streampix?</strong><br />
              A Streampix atua, principalmente, como plataforma de intermediação de pagamentos entre produtores de conteúdo e seu público.</p>

            <p><strong>Como tratamos seus dados?</strong><br />
              Para realizar nossas atividades, é necessário coletar e tratar algumas informações classificadas como dados pessoais pela legislação. Abaixo, apresentamos um resumo das principais práticas adotadas e, se desejar mais detalhes, clique em "Leia Mais" nas seções correspondentes.</p>



            <p><strong>Para que utilizamos seus dados?</strong><br />
              Utilizamos os dados pessoais coletados para finalidades relacionadas à prestação dos nossos serviços, tais como:
              <ul>
                <li>Gerenciamento e manutenção de registros;</li>
                <li>Permitir o acesso e uso da plataforma;</li>
                <li>Validar identidade e garantir segurança;</li>
                <li>Estabelecer contato, quando necessário.</li>
              </ul></p>

            <p><strong>Como protegemos seus dados?</strong><br />
              A Streampix adota medidas técnicas e organizacionais adequadas para proteger seus dados pessoais, tais como:
              <ul>
                <li>Política interna de proteção de dados aplicável a todos os colaboradores;</li>
                <li>Plano de resposta a incidentes de segurança;</li>
                <li>Uso de criptografia com certificado SSL;</li>
                <li>Treinamento contínuo das equipes sobre boas práticas de privacidade e segurança.</li>
              </ul></p>

            <p><strong>Por quanto tempo armazenamos os dados?</strong><br />
              Somente mantemos os dados necessários para as finalidades do tratamento. Conservamos informações requeridas por obrigações legais, regulatórias ou judiciais.</p>

            <p>Ao continuar a usar nosso serviço, você declara ter lido, entendido e concordado com estes Termos e Condições da Streampix.</p>

          </div>
        </div>
      )}
    </div>
  );
};
