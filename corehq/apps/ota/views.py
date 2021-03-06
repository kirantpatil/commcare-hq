from corehq.apps.users.models import CouchUser
from django_digest.decorators import *
from casexml.apps.phone.restore import generate_restore_response



@httpdigest
def restore(request, domain):
    """
    We override restore because we have to supply our own 
    user model (and have the domain in the url)
    """
    user = request.user
    couch_user = CouchUser.from_django_user(user)
    return get_restore_response(couch_user, **get_restore_params(request))

def get_restore_params(request):
    """
    Given a request, get the relevant restore parameters out with sensible defaults
    """
    # not a view just a view util
    return {
        'since': request.GET.get('since'),
        'version': request.GET.get('version', "1.0"),
        'state': request.GET.get('state'),
    }

def get_restore_response(couch_user, since=None, version='1.0', state=None):
    # not a view just a view util
    if not couch_user.is_commcare_user():
        response = HttpResponse("No linked chw found for %s" % couch_user.username)
        response.status_code = 401 # Authentication Failure
        return response

    return generate_restore_response(couch_user.to_casexml_user(), since,
                                     version, state)
