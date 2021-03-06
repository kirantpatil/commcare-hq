import logging
from corehq.apps.sms.util import clean_outgoing_sms_text, create_billable_for_sms
import urllib
from django.conf import settings
import urllib2
from corehq.apps.sms.mixin import SMSBackend
from couchdbkit.ext.django.schema import *
from corehq.apps.mach.forms import MachBackendForm

MACH_URL = "http://smsgw.a2p.mme.syniverse.com/sms.php"

class MachBackend(SMSBackend):
    account_id = StringProperty()
    password = StringProperty()
    sender_id = StringProperty()

    @classmethod
    def get_api_id(cls):
        return "MACH"

    @classmethod
    def get_generic_name(cls):
        return "Mach"

    @classmethod
    def get_template(cls):
        return "mach/backend.html"

    @classmethod
    def get_form_class(cls):
        return MachBackendForm

    def send(self, msg, delay=True, *args, **kwargs):
        params = {
            "id" : self.account_id,
            "pw" : self.password,
            "snr" : self.sender_id,
            "dnr" : msg.phone_number,
        }
        try:
            text = msg.text.encode("iso-8859-1")
            params["msg"] = text
        except UnicodeEncodeError:
            params["msg"] = msg.text.encode("utf-16-be").encode("hex")
            params["encoding"] = "ucs"
        url = "%s?%s" % (MACH_URL, urllib.urlencode(params))
        resp = urllib2.urlopen(url).read()

        create_billable_for_sms(msg, MachBackend.get_api_id(), delay=delay, response=resp)

        return resp
