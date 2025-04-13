import React, { Component } from 'react'
import '../css/aboutPopup.css'

const AboutPopup = ({isVisible, page}) => {
    return (
      <div id={`${page ? 'game-about-popup' : ''}`} className={`about-popup ${isVisible ? 'visible' : 'hidden'}`}>
            <div id={`${page ? 'game-about-popup-div' : ''}`} className='about-popup-div'>
                <svg id={`${page ? 'game-about-popup-logo' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox='0 0 402 48' fill="none" className='site-logo'>
                    <path fill="#FBFBFE" d="M26.206 46.99c-4.646 0-8.949-1.052-12.896-3.156-3.953-2.103-7.073-4.958-9.365-8.565C1.646 31.667.5 27.743.5 23.495c0-4.248 1.146-8.173 3.445-11.774 2.292-3.607 5.418-6.457 9.365-8.566C17.257 1.052 21.56 0 26.206 0h22.923v22.261H34.045c-.22-1.528-.993-2.838-2.317-3.919-1.33-1.08-2.85-1.621-4.566-1.621-1.937 0-3.592.664-4.97 1.991-1.38 1.328-2.066 2.92-2.066 4.777 0 1.856.686 3.443 2.065 4.765 1.38 1.322 3.034 1.98 4.97 1.98 1.735 0 3.28-.553 4.64-1.651 1.355-1.099 2.103-2.427 2.244-3.972h15.084v22.378H26.206ZM71.55 47.994c-2.796 0-5.468-.505-8.024-1.522-2.556-1.016-4.75-2.379-6.583-4.1-1.838-1.722-3.297-3.766-4.382-6.14a17.745 17.745 0 0 1-1.63-7.461c0-2.603.545-5.082 1.63-7.444s2.55-4.4 4.382-6.11c1.833-1.71 4.033-3.073 6.583-4.09a21.504 21.504 0 0 1 8.023-1.521c3.733 0 7.165.852 10.31 2.556 3.144 1.703 5.632 4.024 7.465 6.973 1.832 2.944 2.752 6.157 2.752 9.641 0 2.603-.546 5.088-1.63 7.462-1.085 2.373-2.55 4.418-4.383 6.14-1.839 1.72-4.02 3.09-6.552 4.1A21.167 21.167 0 0 1 71.549 48v-.006Zm-3.396-22.36c-.926.886-1.392 1.956-1.392 3.195 0 1.24.466 2.31 1.392 3.197.925.887 2.04 1.333 3.334 1.333 1.293 0 2.378-.446 3.31-1.334.931-.887 1.39-1.956 1.39-3.196 0-1.24-.465-2.309-1.39-3.196-.926-.887-2.03-1.333-3.31-1.333-1.281 0-2.409.446-3.334 1.333ZM93.902 46.99V10.557H134.9v36.431h-16.972V27.197c0-.975-.331-1.786-.986-2.438-.656-.652-1.496-.975-2.513-.975-1.018 0-1.864.323-2.544.975-.68.652-1.017 1.463-1.017 2.438V46.99H93.896h.006Z"/>
                    <path fill="#ED7E98" d="M178.362 10.558v36.431h-40.998V10.559h16.972V30.35c0 .975.331 1.786.987 2.438.655.652 1.495.975 2.512.975 1.018 0 1.864-.323 2.544-.975.68-.652 1.018-1.463 1.018-2.438V10.558h16.971-.006Z"/>
                    <path fill="#FBFBFE" d="M180.814 46.99V10.557h40.998v36.431H204.84V27.197c0-.975-.331-1.786-.987-2.438-.656-.652-1.495-.975-2.513-.975-1.017 0-1.863.323-2.543.975-.681.652-1.018 1.463-1.018 2.438V46.99h-16.972.007ZM243.932 46.99c-2.777 0-5.412-.482-7.919-1.452-2.507-.963-4.658-2.262-6.466-3.889a18.263 18.263 0 0 1-4.309-5.793 16.144 16.144 0 0 1-1.6-7.027c0-3.366.901-6.45 2.709-9.253 1.808-2.802 4.26-5.006 7.361-6.61 3.102-1.603 6.509-2.408 10.218-2.408h3.861V0h16.996v46.99h-20.857.006Zm-3.353-18.22c0 1.264.447 2.333 1.348 3.214.895.882 1.992 1.322 3.292 1.322 1.299 0 2.409-.44 3.334-1.322.926-.88 1.391-1.95 1.391-3.213 0-1.264-.465-2.274-1.391-3.155-.925-.882-2.041-1.322-3.334-1.322-1.293 0-2.372.434-3.279 1.304-.907.87-1.361 1.927-1.361 3.173ZM267.216 46.99V10.557h26.307v14.34h-8.71V46.99h-17.597ZM336.464 10.558v36.431h-40.998V10.559h16.971V30.35c0 .975.331 1.786.987 2.438.656.652 1.496.975 2.513.975s1.863-.323 2.544-.975c.68-.652 1.017-1.463 1.017-2.438V10.558h16.972-.006ZM338.921 46.99V10.557H401.5v36.431h-16.972V26.591a2.68 2.68 0 0 0-.839-1.992c-.558-.546-1.251-.816-2.066-.816s-1.514.27-2.078.816c-.563.547-.852 1.21-.852 1.992v20.398h-16.971V26.591c0-.782-.276-1.451-.822-1.992-.551-.546-1.231-.816-2.047-.816-.815 0-1.514.27-2.096.816-.576.547-.87 1.21-.87 1.992v20.398h-16.972.006Z"/>
                </svg>
                <div id={`${page ? 'game-about-popup-paragraphs' : ''}`} className='about-popup-paragraphs'>
                    <div className='about-popup-text'>
                        <h3>Представляем способ <span>сделать обучение увлекательным!</span></h3>
                        <p className='paragraph'>Устали от скучных и однообразных опросов? Мы тоже! Именно поэтому мы, команда студентов-энтузиастов, создали CONUNDRUM – веб-сервис, который превращает процесс обучения и проверки знаний в захватывающее приключение.</p>
                        <p className='paragraph'><span>Что это такое?</span></p>
                        <p>Это инновационный инструмент, который автоматически <span>генерирует головоломки</span> – кроссворды и другие задания – по любой теме, тексту или файлу, который вы загрузите. Все это в пару кликов! Теперь <span>проверка знаний станет не рутиной</span>, а <span>увлекательной игрой</span>.</p>
                        <p className='paragraph'><span>Почему это важно?</span></p>
                        <p>В современном мире обучение – это постоянный процесс. Но однообразные <span>тесты для проверки знаний не мотивируют</span> и не вдохновляют. <span>CONUNDRUM меняет это!</span> Наш сервис создан специально для того, чтобы сделать проверку знаний интересной, увлекательной и эффективной. Мы помогаем разнообразить учебный процесс и избавляем вас от скуки.</p>
                    </div>
                    <div className='about-popup-text'>
                        <h3>Мы верим, что <span>обучение должно</span> быть не просто <span>полезным</span>, но и <span>увлекательным</span>.</h3>  
                        <h3>Попробуйте CONUNDRUM и убедитесь сами!</h3>
                    </div>
                    <div className='about-popup-text'>
                        <h3><span>С любовью</span>, команда разработчиков  </h3>
                        <h3>Прилукова Эвелина, Пестова Виктория, Симаков Александр, Слиньков Илья, Ниёзов Денис</h3>
                    </div>
                </div>
                <svg className='logotype' xmlns="http://www.w3.org/2000/svg" viewBox='0 0 512 106' fill="none">
                    <path fill="#FFD951" d="M42.154 21.831c-.621-1.9-2.77-2.956-4.812-2.377-2.028.578-3.163 2.553-2.555 4.452.622 1.9 2.758 2.981 4.8 2.403 2.04-.579 3.19-2.591 2.567-4.478Zm-18.209 5.132c-.608-1.887-2.758-2.944-4.8-2.365-2.04.566-3.176 2.553-2.568 4.453.622 1.886 2.758 2.968 4.8 2.402 2.04-.579 3.19-2.591 2.568-4.49Zm18.21-5.132c-.622-1.9-2.772-2.956-4.813-2.377-2.028.578-3.163 2.553-2.555 4.452.622 1.9 2.758 2.981 4.8 2.403 2.04-.579 3.19-2.591 2.567-4.478Zm-18.21 5.132c-.608-1.887-2.758-2.944-4.8-2.365-2.04.566-3.176 2.553-2.568 4.453.622 1.886 2.758 2.968 4.8 2.402 2.04-.579 3.19-2.591 2.568-4.49Zm18.21-5.132c-.622-1.9-2.772-2.956-4.813-2.377-2.028.578-3.163 2.553-2.555 4.452.622 1.9 2.758 2.981 4.8 2.403 2.04-.579 3.19-2.591 2.567-4.478Zm-23.01 2.767c-2.04.566-3.176 2.553-2.568 4.453.622 1.886 2.758 2.968 4.8 2.402 2.04-.579 3.19-2.591 2.568-4.49-.608-1.887-2.758-2.944-4.8-2.365Zm86.966 49.229c-.095-2.088-1.96-3.71-4.204-3.61-2.23.088-3.975 1.836-3.894 3.912 0 .163.474 15.872-12.315 21.935-7.124 3.383-14.1 3.157-20.751-.654a28 28 0 0 1-2.406-1.547c11.531-.768 24.536-5.534 29.416-15.181.122-.214.23-.428.311-.642.122-.226.216-.465.31-.692.055-.138.123-.289.177-.44.23-.603.432-1.22.69-1.81.337-.806.675-1.611 1-2.416l5.123-12.238c.338-.805.541-1.647.608-2.516v-.024c.014-.139.027-.29.027-.428V43.389c0-.981-.432-1.861-1.122-2.503a3.97 3.97 0 0 0-2.703-1.044c-2.096 0-3.813 1.597-3.813 3.547v5.635a9.715 9.715 0 0 0-4.23.314c-1.88.566-3.408 1.648-4.489 3.019l-.582.503c-2.392-2.767-4.96-5.383-7.516-7.785-.473-.44-.946-.869-1.433-1.296l11.45-4.566c2.38-.943 3.475-3.496 2.46-5.71l-.067-.138c-1.014-2.214-3.771-3.233-6.137-2.29l-7.665 3.057 8.152-9.936c.919-.868 1.392-2 1.392-3.132 0-1.132-.473-2.277-1.392-3.132-1.866-1.736-4.88-1.736-6.733 0L58.701 33.805a47.982 47.982 0 0 0-5.65-1.987 62.093 62.093 0 0 0-1.46-.403c.743-1.635 1.149-3.345 1.162-5.094 1.987.377 4.326 1.057 6.935 2.025.176.063.298.113.325.113a.447.447 0 0 0 .256 0 .429.429 0 0 0 .311-.301c.068-.227-.067-.466-.297-.554a2.68 2.68 0 0 1-.243-.088c-1.947-.717-4.678-1.622-7.314-2.113-.04-.73-.162-1.471-.351-2.213 1.96.301 4.258.892 6.813 1.735.19.063.311.1.338.113a.47.47 0 0 0 .23-.012.463.463 0 0 0 .324-.315c.068-.226-.08-.465-.324-.54l-.243-.076c-1.974-.654-4.76-1.471-7.422-1.861a10.463 10.463 0 0 0-.487-1.22c2.244-.73 5.435-1.22 9.328-1.41.19-.012.324-.024.338-.024h.054a.44.44 0 0 0 .338-.478.474.474 0 0 0-.527-.39c-.04 0-.122 0-.257.025-2.663.113-6.651.465-9.666 1.484a14.518 14.518 0 0 0-2.014-2.805c-2.001-2.188-4.84-5.597-6.07-8.276a17.043 17.043 0 0 1-1.257-3.823c-.257-1.308-.298-2.78-1.041-3.975C39.64-.519 36.977-.205 35.287.84c-1.987 1.233-3.19 3.296-4.015 5.32-.54 1.384-.892 3.472-1.244 5.183-.08 0-.135 0-.216.012-1.69.038-2.974.302-4.542.717-1.555.465-3.096 1.031-4.502 1.836a.54.54 0 0 0-.19.1c-1.31-1.245-2.865-2.791-4.136-3.66C14.55 9.09 12.32 7.984 9.94 7.997c-2.028 0-4.448 1.132-4.313 3.283.095 1.383.933 2.616 1.501 3.848a17.154 17.154 0 0 1 1.244 3.824c.58 2.867.257 7.169-.109 10.024a13.456 13.456 0 0 0 .122 4.1c-2.906 1.296-6.03 3.71-8.016 5.409-.095.088-.15.15-.176.163-.203.151-.257.415-.108.617a.488.488 0 0 0 .54.163c.04-.012.095-.025.136-.063.027-.012.108-.088.257-.214 2.852-2.44 5.448-4.2 7.583-5.182.054.227.122.44.19.654.148.466.324.919.527 1.346-2.136.994-4.204 2.252-5.705 3.233a1.333 1.333 0 0 1-.203.138c-.216.126-.297.377-.175.591a.488.488 0 0 0 .554.214.265.265 0 0 0 .095-.025c.026-.013.121-.088.283-.189 2.015-1.32 3.867-2.377 5.557-3.157.27.516.594 1.019.946 1.497-1.933 1.76-3.704 3.937-4.908 5.547-.067.1-.121.163-.148.188a.428.428 0 0 0 .054.617.51.51 0 0 0 .46.1c.08-.025.148-.075.216-.126.027-.025.08-.113.216-.276 1.622-2.189 3.218-3.987 4.691-5.333 2.677 3.132 6.881 5.056 11.788 5.672.325.868.65 1.723.892 2.591 1.501 5.522 1.96 11.282 3.448 16.817 3.204 11.973 9.733 24.928 22.738 28.764C54.403 98.428 63.784 106 75.843 106c4.218 0 8.76-.931 13.532-3.195 17.479-8.288 16.777-28.123 16.736-28.966v-.012Zm-84.41-41.418c-2.623.73-5.38-.63-6.178-3.07-.798-2.427.676-4.992 3.299-5.722 2.608-.742 5.366.616 6.164 3.056s-.676 4.994-3.285 5.736Zm10.653-2.642-.446.818a.788.788 0 0 1-1.055.302l-.865-.453a.715.715 0 0 1-.365-.402c-.108-.353.081-.768.514-.893l1.31-.365c.65-.189 1.217.44.907.993Zm7.543-2.502c-2.61.742-5.367-.63-6.165-3.07-.797-2.427.676-4.98 3.286-5.722 2.622-.742 5.38.629 6.177 3.056.798 2.44-.689 4.993-3.298 5.736ZM138.562 44.2c-2.109 0-4.058-.133-5.846-.4-1.789-.267-3.445-.653-4.966-1.16-1.495-.507-2.844-1.12-4.045-1.84a16.868 16.868 0 0 1-3.124-2.44 14.182 14.182 0 0 1-2.282-2.96 14.397 14.397 0 0 1-1.322-3.48 16.6 16.6 0 0 1-.44-3.88c0-2.213.36-4.2 1.081-5.96.721-1.76 1.735-3.28 3.043-4.56 1.335-1.28 2.91-2.347 4.726-3.2 1.842-.853 3.871-1.48 6.087-1.88 2.216-.427 4.579-.64 7.088-.64 4.432 0 8.197.533 11.294 1.6 3.097 1.067 5.539 2.6 7.328 4.6 1.816 2 2.95 4.427 3.404 7.28l-17.02 2.76c0-.613-.133-1.133-.4-1.56a3.004 3.004 0 0 0-1.081-1.08 5.411 5.411 0 0 0-1.602-.6 8.69 8.69 0 0 0-1.923-.2c-.961 0-1.815.133-2.563.4-.747.24-1.348.613-1.802 1.12-.427.48-.64 1.093-.64 1.84 0 .453.08.867.24 1.24.16.373.387.707.681 1 .293.267.64.493 1.041.68.427.16.894.293 1.401.4.508.08 1.055.12 1.642.12 1.415 0 2.603-.28 3.565-.84.961-.587 1.441-1.427 1.441-2.52l17.02 1.72a15.394 15.394 0 0 1-1.962 5.56c-.988 1.733-2.376 3.267-4.165 4.6-1.762 1.333-3.965 2.373-6.608 3.12-2.616.773-5.713 1.16-9.291 1.16ZM163.444 19.64c1.949-.88 4.058-1.533 6.327-1.96a35.483 35.483 0 0 1 6.888-.68c2.243 0 4.405.213 6.488.64 2.082.427 3.938 1.08 5.566 1.96 1.656.88 2.964 1.973 3.925 3.28.961 1.307 1.442 2.84 1.442 4.6V43h-14.017v-8.4c0-.48-.16-.867-.48-1.16a2.555 2.555 0 0 0-1.162-.6 4.807 4.807 0 0 0-1.361-.2c-1.015 0-1.789.2-2.323.6-.507.4-.761.853-.761 1.36 0 .507.267.973.801 1.4.534.4 1.295.6 2.283.6.48 0 1.028-.093 1.642-.28.614-.187 1.081-.667 1.401-1.44a238.367 238.367 0 0 1-1.722 3.92l-1.682 3.92c-.961.48-1.975.813-3.043 1-1.042.213-2.083.32-3.124.32a12.8 12.8 0 0 1-3.644-.52c-1.148-.32-2.189-.8-3.124-1.44a7.16 7.16 0 0 1-2.162-2.4c-.534-.96-.801-2.08-.801-3.36 0-.773.133-1.533.4-2.28a7.334 7.334 0 0 1 1.202-2.12 8.022 8.022 0 0 1 2.002-1.76c.827-.507 1.802-.893 2.923-1.16 1.122-.293 2.403-.44 3.845-.44.934 0 1.842.08 2.723.24.881.133 1.709.347 2.483.64a9.305 9.305 0 0 1 2.122 1.08c.641.427 1.162.907 1.562 1.44v-.36c0-.827-.213-1.533-.641-2.12-.4-.613-.961-1.107-1.682-1.48-.694-.4-1.508-.693-2.442-.88a14.296 14.296 0 0 0-2.884-.28c-1.575 0-3.163.2-4.765.6-1.602.4-3.004.987-4.205 1.76v-9.56ZM209.439 29.08c.321-1.227.628-2.44.921-3.64.321-1.2.628-2.4.921-3.6.321-1.227.628-2.44.921-3.64h7.81v10.88h-10.573Zm-13.736 3.48V18.12l13.696-3.28V28.88c0 .507.107.947.321 1.32.24.373.56.693.961.96.427.24.921.427 1.481.56.561.133 1.188.2 1.883.2a8.2 8.2 0 0 0 2.362-.36 8.04 8.04 0 0 0 2.163-1c.667-.427 1.148-.92 1.442-1.48v12.16c-1.148.907-2.63 1.573-4.446 2-1.815.453-3.631.68-5.446.68-2.75 0-5.219-.44-7.409-1.32-2.162-.907-3.871-2.2-5.126-3.88-1.255-1.707-1.882-3.76-1.882-6.16ZM221.63 24.48h14.817v10.4H221.63v-10.4ZM255.676 44.2c-2.509 0-4.859-.28-7.048-.84-2.163-.56-4.072-1.4-5.727-2.52a12.554 12.554 0 0 1-3.844-4.28c-.935-1.707-1.402-3.693-1.402-5.96 0-1.173.12-2.267.36-3.28a11.793 11.793 0 0 1 1.122-2.8c.48-.88 1.054-1.68 1.722-2.4.694-.72 1.468-1.36 2.323-1.92a16.135 16.135 0 0 1 3.604-1.76c1.308-.48 2.71-.84 4.205-1.08 1.521-.24 3.083-.36 4.685-.36 3.07 0 5.834.427 8.29 1.28 2.483.827 4.525 2.08 6.127 3.76 1.629 1.68 2.643 3.787 3.044 6.32l-12.855 2.28c0-.72-.227-1.307-.681-1.76-.454-.453-1.028-.773-1.722-.96a7.461 7.461 0 0 0-2.203-.32c-.854 0-1.642.12-2.363.36-.694.213-1.241.547-1.642 1-.4.427-.6.973-.6 1.64 0 .507.107.947.32 1.32.24.373.574.693 1.001.96.428.24.921.427 1.482.56.561.107 1.161.16 1.802.16a8.29 8.29 0 0 0 2.163-.28c.721-.187 1.308-.493 1.762-.92.454-.453.681-1.04.681-1.76a279.4 279.4 0 0 1 6.447.84l6.448.84c-.321 2.587-1.282 4.773-2.884 6.56-1.575 1.76-3.631 3.093-6.167 4-2.51.88-5.326 1.32-8.45 1.32ZM274.504 43V13h13.857V43h-13.857Zm18.102 0V30.56c0-.773-.201-1.333-.601-1.68a2.093 2.093 0 0 0-1.362-.56 3.856 3.856 0 0 0-1.481.12c-.428.133-.694.28-.801.44l3.203-10.28a14.337 14.337 0 0 1 3.084-.96 16.934 16.934 0 0 1 3.244-.32c1.495 0 2.883.24 4.165.72 1.308.48 2.363 1.24 3.164 2.28.827 1.04 1.241 2.427 1.241 4.16V43h-13.856ZM317.533 47.8c.481-.533.948-1.067 1.402-1.6l1.361-1.6c.481-.533.948-1.067 1.402-1.6h-7.489c-.881-2.773-1.762-5.533-2.643-8.28l-2.643-8.24c-.881-2.773-1.762-5.533-2.643-8.28h14.697a941.26 941.26 0 0 1 1.402 8.56l1.441 8.56v.12l.04.12v-.04a.307.307 0 0 0 .041-.12v-.04c.347-1.92.68-3.827 1.001-5.72.32-1.92.64-3.827.961-5.72.347-1.92.681-3.827 1.001-5.72H340.8c-1.068 3.307-2.149 6.6-3.243 9.88l-3.204 9.84c-1.068 3.28-2.149 6.573-3.244 9.88h-13.576ZM367.213 44.2c-2.509 0-4.859-.28-7.048-.84-2.163-.56-4.072-1.4-5.727-2.52a12.554 12.554 0 0 1-3.844-4.28c-.935-1.707-1.402-3.693-1.402-5.96 0-1.173.12-2.267.36-3.28a11.793 11.793 0 0 1 1.122-2.8c.48-.88 1.054-1.68 1.722-2.4.694-.72 1.468-1.36 2.323-1.92a16.135 16.135 0 0 1 3.604-1.76c1.308-.48 2.71-.84 4.205-1.08 1.521-.24 3.083-.36 4.685-.36 3.07 0 5.834.427 8.29 1.28 2.483.827 4.525 2.08 6.127 3.76 1.629 1.68 2.643 3.787 3.044 6.32l-12.855 2.28c0-.72-.227-1.307-.681-1.76-.454-.453-1.028-.773-1.722-.96a7.461 7.461 0 0 0-2.203-.32c-.854 0-1.642.12-2.363.36-.694.213-1.241.547-1.642 1-.4.427-.6.973-.6 1.64 0 .507.107.947.32 1.32.24.373.574.693 1.001.96.427.24.921.427 1.482.56.561.107 1.161.16 1.802.16a8.29 8.29 0 0 0 2.163-.28c.721-.187 1.308-.493 1.762-.92.454-.453.681-1.04.681-1.76a279.4 279.4 0 0 1 6.447.84l6.448.84c-.321 2.587-1.282 4.773-2.884 6.56-1.575 1.76-3.631 3.093-6.167 4-2.51.88-5.326 1.32-8.45 1.32ZM403.662 44.2c-1.655 0-3.257-.12-4.806-.36-1.548-.24-2.99-.6-4.325-1.08a17.413 17.413 0 0 1-3.644-1.88 12.45 12.45 0 0 1-2.803-2.6 11.858 11.858 0 0 1-1.802-3.4c-.427-1.28-.641-2.693-.641-4.24 0-1.813.294-3.44.881-4.88a11.811 11.811 0 0 1 2.563-3.84c1.121-1.093 2.43-2 3.925-2.72 1.495-.747 3.137-1.293 4.925-1.64a28.39 28.39 0 0 1 5.727-.56c2.51 0 4.846.293 7.008.88 2.19.56 4.098 1.413 5.727 2.56 1.655 1.12 2.95 2.533 3.885 4.24.934 1.707 1.401 3.693 1.401 5.96s-.467 4.253-1.401 5.96c-.935 1.68-2.23 3.093-3.885 4.24-1.629 1.12-3.537 1.96-5.727 2.52-2.162.56-4.498.84-7.008.84Zm.04-10.6c1.655 0 2.83-.32 3.524-.96.694-.64 1.042-1.333 1.042-2.08 0-.347-.081-.693-.241-1.04a2.812 2.812 0 0 0-.761-.96c-.347-.293-.814-.52-1.401-.68-.588-.187-1.309-.28-2.163-.28-.854 0-1.588.093-2.202.28-.588.16-1.068.387-1.442.68a2.812 2.812 0 0 0-.761.96 2.55 2.55 0 0 0-.24 1.08c0 .373.08.747.24 1.12.16.347.427.667.801.96.374.267.854.493 1.442.68.587.16 1.308.24 2.162.24ZM445.868 43V30.16c0-.507-.133-.947-.4-1.32a3.055 3.055 0 0 0-1.081-.92 5.39 5.39 0 0 0-1.522-.52 7.596 7.596 0 0 0-1.762-.2c-1.549 0-2.71.307-3.484.92-.748.613-1.122 1.293-1.122 2.04 0 .56.161 1.067.481 1.52.347.453.854.827 1.522 1.12.694.267 1.562.4 2.603.4 1.121 0 2.122-.2 3.003-.6.881-.4 1.455-1.053 1.722-1.96L442.625 43c-.855.213-1.669.36-2.443.44-.774.107-1.669.16-2.683.16-2.056 0-3.992-.28-5.807-.84-1.816-.587-3.418-1.44-4.806-2.56a12.426 12.426 0 0 1-3.244-4.08c-.774-1.6-1.161-3.427-1.161-5.48 0-1.76.28-3.333.841-4.72.561-1.413 1.322-2.64 2.283-3.68a13.538 13.538 0 0 1 3.404-2.6 15.68 15.68 0 0 1 4.084-1.52 19.292 19.292 0 0 1 4.446-.52 22.706 22.706 0 0 1 3.764.32c.614.107 1.188.253 1.722.44a7.953 7.953 0 0 1 1.522.68 5.567 5.567 0 0 1 1.281.96c.027-.027.04-.053.04-.08V13h13.857v30h-13.857ZM479.026 33.96c1.415 0 2.509-.253 3.284-.76.774-.507 1.174-1.2 1.201-2.08l12.374 4.04c-.48 1.68-1.508 3.213-3.083 4.6-1.549 1.36-3.511 2.44-5.887 3.24-2.376.8-5.033 1.2-7.969 1.2-2.51 0-4.859-.28-7.049-.84-2.162-.56-4.071-1.4-5.726-2.52a12.557 12.557 0 0 1-3.845-4.28c-.934-1.707-1.401-3.693-1.401-5.96s.467-4.253 1.401-5.96a12.194 12.194 0 0 1 3.845-4.24c1.655-1.147 3.577-2 5.766-2.56 2.19-.56 4.526-.84 7.009-.84 2.536 0 4.859.28 6.968.84 2.136.56 3.964 1.427 5.486 2.6 1.549 1.147 2.737 2.613 3.564 4.4.855 1.76 1.282 3.853 1.282 6.28H474.38v.04c0 .4.107.773.321 1.12.213.347.507.653.881.92.4.24.881.427 1.441.56.588.133 1.255.2 2.003.2Zm-.08-6.84c-1.309 0-2.39.24-3.244.72-.854.453-1.282 1.107-1.282 1.96v.08H483.431v-.08c0-.427-.12-.8-.361-1.12a2.34 2.34 0 0 0-.921-.84c-.4-.24-.881-.413-1.441-.52a7.275 7.275 0 0 0-1.762-.2ZM497.383 43V31.76H512V43h-14.617Zm0-13.56V18.2H512v11.24h-14.617Z"></path>
                    <path fill="#353536" d="M116.937 96V66h16.62v30h-16.62ZM170.963 66v12.16h-9.651l-.04.04h-.04V96h-16.619V78.24c0-.027-.014-.04-.04-.04 0-.027-.014-.04-.04-.04h-9.652V66h36.082ZM172.275 77.48h14.818v10.4h-14.818v-10.4ZM188.701 96V82.04H202.557V96h-13.856Zm0-13.96V71.2h13.856v7.92l-.04.04c-2.296.48-4.605.96-6.928 1.44l-6.888 1.44ZM204.149 96V71.2h13.856V96h-13.856Zm18.341 0V83.36c0-.773-.2-1.32-.601-1.64-.373-.32-.827-.493-1.361-.52a3.843 3.843 0 0 0-1.482.2c-.427.16-.694.32-.801.48l3.204-10.28c1.949-.853 4.058-1.28 6.327-1.28 1.122 0 2.19.133 3.204.4a8.455 8.455 0 0 1 2.723 1.24 5.612 5.612 0 0 1 1.923 2.24c.48.907.72 2 .72 3.28V96H222.49Zm18.101 0V83.36c0-.773-.2-1.32-.6-1.64-.374-.32-.828-.493-1.362-.52a3.843 3.843 0 0 0-1.482.2c-.427.16-.694.32-.801.48l2.804-10.28a14.328 14.328 0 0 1 3.083-.96c1.122-.213 2.23-.32 3.324-.32 1.549 0 2.99.24 4.325.72 1.362.48 2.456 1.24 3.284 2.28.854 1.04 1.282 2.427 1.282 4.16V96h-13.857ZM293.25 83.56c0 2-.414 3.8-1.242 5.4a12.856 12.856 0 0 1-3.363 4.12 15.205 15.205 0 0 1-4.726 2.64c-1.762.587-3.591.88-5.486.88-.962 0-1.963-.093-3.004-.28a18.48 18.48 0 0 1-2.963-.72 13.033 13.033 0 0 1-2.523-1.24h-.08v6.44h-13.857V71.2h13.857V83.64c0 .507.133.947.4 1.32.267.373.627.68 1.081.92.454.24.961.427 1.522.56.587.107 1.175.16 1.762.16 1.041 0 1.896-.147 2.563-.44.694-.293 1.202-.667 1.522-1.12.347-.453.52-.92.52-1.4 0-.427-.093-.813-.28-1.16a2.612 2.612 0 0 0-.841-.96c-.374-.293-.854-.52-1.442-.68-.587-.16-1.268-.24-2.042-.24-1.121 0-2.122.2-3.003.6-.855.4-1.429 1.053-1.722 1.96l3.203-11.96c.881-.213 1.749-.36 2.603-.44.855-.107 1.696-.16 2.523-.16 1.629 0 3.191.187 4.686.56 1.522.373 2.897.92 4.125 1.64a12.8 12.8 0 0 1 3.283 2.68 11.157 11.157 0 0 1 2.163 3.6c.507 1.333.761 2.827.761 4.48ZM312.07 97.2c-1.655 0-3.257-.12-4.805-.36-1.549-.24-2.99-.6-4.325-1.08a17.396 17.396 0 0 1-3.645-1.88 12.45 12.45 0 0 1-2.803-2.6 11.858 11.858 0 0 1-1.802-3.4c-.427-1.28-.641-2.693-.641-4.24 0-1.813.294-3.44.881-4.88a11.827 11.827 0 0 1 2.563-3.84c1.122-1.093 2.43-2 3.925-2.72 1.495-.747 3.137-1.293 4.926-1.64a28.373 28.373 0 0 1 5.726-.56c2.51 0 4.846.293 7.009.88 2.189.56 4.098 1.413 5.726 2.56 1.656 1.12 2.95 2.533 3.885 4.24.934 1.707 1.402 3.693 1.402 5.96s-.468 4.253-1.402 5.96c-.935 1.68-2.229 3.093-3.885 4.24-1.628 1.12-3.537 1.96-5.726 2.52-2.163.56-4.499.84-7.009.84Zm.04-10.6c1.656 0 2.83-.32 3.525-.96.694-.64 1.041-1.333 1.041-2.08 0-.347-.08-.693-.24-1.04a2.824 2.824 0 0 0-.761-.96c-.347-.293-.815-.52-1.402-.68-.587-.187-1.308-.28-2.163-.28-.854 0-1.588.093-2.202.28-.588.16-1.068.387-1.442.68a2.812 2.812 0 0 0-.761.96 2.55 2.55 0 0 0-.24 1.08c0 .373.08.747.24 1.12.16.347.427.667.801.96.374.267.855.493 1.442.68.587.16 1.308.24 2.162.24ZM330.889 79.12c0-1.52.427-2.84 1.282-3.96.881-1.12 2.069-2.053 3.564-2.8 1.495-.773 3.19-1.347 5.086-1.72a30.617 30.617 0 0 1 5.927-.56c2.536 0 4.886.227 7.048.68 2.189.453 4.165 1.053 5.927 1.8v9.28c-.747-.56-1.735-1.04-2.963-1.44a23.842 23.842 0 0 0-3.845-.92 24.146 24.146 0 0 0-3.804-.32c-.801 0-1.535.053-2.203.16-.641.08-1.161.213-1.562.4-.373.187-.56.427-.56.72 0 .16.053.28.16.36.133.08.32.133.56.16.241.027.548.04.922.04H349.671c1.335 0 2.67.093 4.005.28 1.362.16 2.59.493 3.684 1 1.122.507 2.016 1.24 2.683 2.2.668.933 1.002 2.173 1.002 3.72 0 1.627-.454 3.013-1.362 4.16-.881 1.12-2.096 2.04-3.644 2.76-1.522.693-3.244 1.2-5.166 1.52-1.896.32-3.871.48-5.927.48-2.43 0-4.833-.227-7.209-.68-2.349-.453-4.365-1.12-6.047-2v-9.76c.668.72 1.616 1.32 2.844 1.8 1.254.453 2.603.8 4.044 1.04 1.469.213 2.844.32 4.125.32.828 0 1.575-.04 2.243-.12.667-.107 1.188-.253 1.562-.44.4-.213.6-.48.6-.8 0-.133-.04-.227-.12-.28-.08-.053-.213-.093-.4-.12a4.407 4.407 0 0 0-.681-.04h-2.403c-.934 0-1.976-.027-3.124-.08a29.035 29.035 0 0 1-3.363-.44c-1.122-.24-2.15-.6-3.084-1.08a6.223 6.223 0 0 1-2.203-2.04c-.56-.88-.841-1.973-.841-3.28ZM375.92 97.12c-2.43 0-4.833-.227-7.209-.68-2.349-.453-4.365-1.12-6.047-2v-9.76c.668.72 1.615 1.32 2.843 1.8 1.255.453 2.603.8 4.045 1.04 1.469.213 2.843.32 4.125.32.828 0 1.575-.04 2.243-.12.667-.107 1.188-.253 1.561-.44.401-.213.601-.48.601-.8 0-.133-.04-.227-.12-.28-.08-.053-.214-.093-.401-.12a4.4 4.4 0 0 0-.68-.04h-2.403c-.935 0-1.976-.027-3.124-.08a29.08 29.08 0 0 1-3.364-.44c-1.121-.24-2.149-.6-3.083-1.08a6.223 6.223 0 0 1-2.203-2.04c-.561-.88-.841-1.973-.841-3.28 0-1.52.427-2.84 1.282-3.96.881-1.12 2.069-2.053 3.564-2.8 1.495-.773 3.19-1.347 5.086-1.72a30.61 30.61 0 0 1 5.927-.56c2.536 0 4.885.227 7.048.68 2.189.453 4.165 1.053 5.927 1.8v9.28c-.748-.56-1.735-1.04-2.964-1.44a23.804 23.804 0 0 0-3.844-.92 24.148 24.148 0 0 0-3.805-.32c-.8 0-1.535.053-2.202.16-.641.08-1.161.213-1.562.4-.374.187-.561.427-.561.72 0 .16.054.28.161.36.133.08.32.133.56.16.241.027.548.04.921.04h3.244c1.335 0 2.67.093 4.005.28 1.361.16 2.59.493 3.684 1 1.121.507 2.016 1.24 2.683 2.2.668.933 1.001 2.173 1.001 3.72 0 1.627-.453 3.013-1.361 4.16-.881 1.12-2.096 2.04-3.644 2.76-1.522.693-3.244 1.2-5.166 1.52-1.896.32-3.872.48-5.927.48ZM393.237 96V82.04h13.857V96h-13.857Zm0-13.96V71.2h13.857v7.92l-.04.04c-2.296.48-4.606.96-6.929 1.44l-6.888 1.44ZM408.685 66h13.856v17.64c0 .507.134.947.401 1.32.267.373.627.68 1.081.92.454.24.961.427 1.522.56.587.107 1.175.16 1.762.16 1.575 0 2.737-.307 3.484-.92.748-.613 1.121-1.293 1.121-2.04 0-.56-.173-1.067-.52-1.52-.321-.453-.828-.813-1.522-1.08-.667-.293-1.522-.44-2.563-.44-1.121 0-2.122.2-3.004.6-.854.4-1.428 1.053-1.722 1.96l3.164-11.96c.881-.213 1.749-.36 2.603-.44.881-.107 1.736-.16 2.563-.16 2.056 0 3.992.293 5.807.88 1.815.56 3.404 1.4 4.766 2.52a11.764 11.764 0 0 1 3.243 4.08c.801 1.6 1.202 3.427 1.202 5.48 0 1.973-.401 3.76-1.202 5.36a12.38 12.38 0 0 1-3.203 4.12 14.517 14.517 0 0 1-4.526 2.64c-1.682.613-3.43.92-5.246.92-.774 0-1.575-.053-2.403-.16a15.477 15.477 0 0 1-2.402-.52 11.092 11.092 0 0 1-2.323-1 9.421 9.421 0 0 1-2.002-1.6c-.027-.027-.054-.027-.081 0V96h-13.856V66ZM447.129 96V66h13.856v30h-13.856ZM480.277 86.96c1.415 0 2.51-.253 3.284-.76s1.175-1.2 1.201-2.08l12.375 4.04c-.481 1.68-1.508 3.213-3.084 4.6-1.548 1.36-3.51 2.44-5.887 3.24-2.376.8-5.032 1.2-7.969 1.2-2.509 0-4.859-.28-7.048-.84-2.163-.56-4.072-1.4-5.727-2.52a12.554 12.554 0 0 1-3.844-4.28c-.935-1.707-1.402-3.693-1.402-5.96s.467-4.253 1.402-5.96a12.191 12.191 0 0 1 3.844-4.24c1.655-1.147 3.578-2 5.767-2.56 2.189-.56 4.525-.84 7.008-.84 2.536 0 4.859.28 6.968.84 2.136.56 3.965 1.427 5.487 2.6 1.548 1.147 2.736 2.613 3.564 4.4.854 1.76 1.281 3.853 1.281 6.28h-21.865v.04c0 .4.107.773.32 1.12.214.347.507.653.881.92.401.24.881.427 1.442.56.587.133 1.255.2 2.002.2Zm-.08-6.84c-1.308 0-2.389.24-3.244.72-.854.453-1.281 1.107-1.281 1.96v.08H484.682v-.08c0-.427-.12-.8-.36-1.12a2.353 2.353 0 0 0-.921-.84c-.401-.24-.881-.413-1.442-.52a7.27 7.27 0 0 0-1.762-.2Z"></path>
                </svg>
            </div>
      </div>
    )
}


export default AboutPopup;