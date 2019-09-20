# Programa em python que faz a interface da comunicação entre o painel e os robôs

import txaio
txaio.use_twisted()

import os
import struct
import binascii

from twisted.internet.defer import inlineCallbacks

from autobahn.wamp.types import PublishOptions, SubscribeOptions,EncodedPayload
from autobahn.wamp.interfaces import IPayloadCodec

from autobahn.twisted.util import sleep
from autobahn.twisted.wamp import ApplicationSession, ApplicationRunner

# topic we publish and subscribe to
TOPIC = u'uepg.LuizRodolfo.painel'


class CodecMqtt(object):
    """
    Our codec to encode/decode our custom binary payload. This is needed
    in "payload transparency mode" (a WAMP AP / Crossbar.io feature), so
    the app code is shielded, so you can write your code as usual in Autobahn/WAMP.
    """

    # binary payload format we use in this example:
    # unsigned short + signed int + 8 bytes (all big endian)
    FORMAT = '>6s'

    def encode(self, is_originating, uri, args=None, kwargs=None):
        # Autobahn wants to send custom payload: convert to an instance
        # of EncodedPayload
        payload = struct.pack(self.FORMAT, args[0])
        return EncodedPayload(payload, u'mqtt')

    def decode(self, is_originating, uri, encoded_payload):
        # Autobahn has received a custom payload.
        # convert it into a tuple: (uri, args, kwargs)
        return uri, struct.unpack(self.FORMAT, encoded_payload.payload), None

# we need to register our codec!
IPayloadCodec.register(CodecMqtt)


class MySession(ApplicationSession):
    def __init__(self, config):
        ApplicationSession.__init__(self, config)
        self.init()

    def init(self):
        self.mensagem = b'default'

    @inlineCallbacks
    def onJoin(self, details):
        self.log.info('session joined: {details}', details=details)

        # this is the one and only line of code that is different from a regular
        # WAMP app session: we set our codec, and everything else is transparent (!)
        self.set_payload_codec(CodecMqtt())

        def setPotenciaEsq1(valor):
            msg = u'L1-'+str(valor)

            self.mensagem = bytes(msg, encoding= 'utf-8')
            return msg
            

        def setPotenciaDir1(valor):
            msg = u'R1-'+str(valor)

            self.mensagem = bytes(msg, encoding= 'utf-8')
            return msg

        def setVelocidade1(valor):
            msg = u'V1-'+str(valor)

            self.mensagem = bytes(msg, encoding= 'utf-8')
            return msg
        
        def setPotenciaEsq2(valor):
            msg = u'L2-'+str(valor)

            self.mensagem = bytes(msg, encoding= 'utf-8')
            return msg
            

        def setPotenciaDir2(valor):
            msg = u'R2-'+str(valor)

            self.mensagem = bytes(msg, encoding= 'utf-8')
            return msg

        def setVelocidade2(valor):
            msg = u'V2-'+str(valor)

            self.mensagem = bytes(msg, encoding= 'utf-8')
            return msg


        self.register(setPotenciaEsq1, 'uepg.LuizRodolfo.robo_1.setPotenciaEsq')
        self.register(setPotenciaDir1, 'uepg.LuizRodolfo.robo_1.setPotenciaDir')
        self.register(setVelocidade1, 'uepg.LuizRodolfo.robo_1.setVelocidade')
        self.register(setPotenciaEsq2, 'uepg.LuizRodolfo.robo_2.setPotenciaEsq')
        self.register(setPotenciaDir2, 'uepg.LuizRodolfo.robo_2.setPotenciaDir')
        self.register(setVelocidade2, 'uepg.LuizRodolfo.robo_2.setVelocidade')

        while True:
            if self.mensagem != b'default':
                pub = yield self.publish(
                    TOPIC,
                    self.mensagem,
                )
            self.mensagem = b'default'
            yield sleep(0.01)
            

if __name__ == '__main__':
    txaio.start_logging(level='info')
#    runner = ApplicationRunner(u'rs://18.229.134.56:8080', u'tcc')
    runner = ApplicationRunner(u'ws://localhost:8080/ws', u'tcc')
    runner.run(MySession)
